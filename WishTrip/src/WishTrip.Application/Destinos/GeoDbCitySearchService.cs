using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace WishTrip.Destinos
{
    public class GeoDbCitySearchService : ICitySearchService, ITransientDependency
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GeoDbCitySearchService> _logger;
        private const int MaxLimit = 10;

        public GeoDbCitySearchService(
            IHttpClientFactory httpClientFactory,
            ILogger<GeoDbCitySearchService> logger,
            IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto request)
        {
            var result = new CitySearchResultDto();
            if (request == null) return result;

            var requested = request.MaxResultCount > 0 ? request.MaxResultCount : 10;
            var limit = Math.Clamp(requested, 1, MaxLimit);
            var offset = Math.Max(request.SkipCount, 0);

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("WishTripApp/1.0");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string? cityInput = request.PartialName?.Trim();
            string? countryInput = request.Country?.Trim();
            string? regionInput = request.Region?.Trim();

            if (string.IsNullOrWhiteSpace(cityInput) && !string.IsNullOrWhiteSpace(request.Destination))
            {
                cityInput = request.Destination.Trim();
            }

            if (!string.IsNullOrWhiteSpace(cityInput) && !string.IsNullOrWhiteSpace(countryInput) &&
                cityInput.Equals(countryInput, StringComparison.OrdinalIgnoreCase))
            {
                cityInput = null;
            }

            // Si solo hay región, la usamos como ciudad
            if (string.IsNullOrWhiteSpace(countryInput) && string.IsNullOrWhiteSpace(cityInput) && !string.IsNullOrWhiteSpace(regionInput))
            {
                cityInput = regionInput;
            }

            try
            {
                string? resolvedIsoCode = null;

                if (!string.IsNullOrWhiteSpace(countryInput))
                {
                    resolvedIsoCode = await ResolveCountryIso2Async(client, countryInput);

                    if (string.IsNullOrWhiteSpace(resolvedIsoCode))
                    {
                        return result;
                    }
                }

                var urlBuilder = new StringBuilder("https://geodb-free-service.wirefreethought.com/v1/geo/cities?");

                urlBuilder.Append($"limit={limit}&offset={offset}&hateoasMode=false&sort=-population");

                if (!string.IsNullOrWhiteSpace(resolvedIsoCode))
                {
                    urlBuilder.Append($"&countryIds={Uri.EscapeDataString(resolvedIsoCode)}");
                }

                if (!string.IsNullOrWhiteSpace(cityInput))
                {
                    urlBuilder.Append($"&namePrefix={Uri.EscapeDataString(cityInput)}");
                }

                if (request.MinPopulation.HasValue && request.MinPopulation.Value > 0)
                {
                    urlBuilder.Append($"&minPopulation={request.MinPopulation.Value}");
                }

                var url = urlBuilder.ToString();

                var cities = await GetCitiesFromUrlAsync(client, url);

                if (!string.IsNullOrWhiteSpace(regionInput))
                {
                    var regionNormalized = RemoveDiacritics(regionInput);

                    cities = cities.Where(c =>
                        !string.IsNullOrWhiteSpace(c.Region) &&
                        RemoveDiacritics(c.Region).Contains(regionNormalized, StringComparison.OrdinalIgnoreCase)
                    ).ToList();
                }

                result.Cities = cities;
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en GeoDbCitySearchService");
                return result;
            }
        }

        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();
            foreach (var c in normalizedString)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }
            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        private async Task<List<CityDto>> GetCitiesFromUrlAsync(HttpClient client, string url)
        {
            try
            {
                using var resp = await client.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return new List<CityDto>();
                var body = await resp.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true, NumberHandling = JsonNumberHandling.AllowReadingFromString };
                var root = JsonSerializer.Deserialize<GeoDbResponseRoot>(body, options);
                return root?.Data?.Select(MapGeoDbToDto).ToList() ?? new List<CityDto>();
            }
            catch { return new List<CityDto>(); }
        }

        private async Task<string?> ResolveCountryIso2Async(HttpClient client, string countryName)
        {
            var url = $"https://geodb-free-service.wirefreethought.com/v1/geo/countries?namePrefix={Uri.EscapeDataString(countryName)}&limit=5&offset=0&hateoasMode=false";
            try
            {
                using var resp = await client.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return null;
                var body = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);
                if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in data.EnumerateArray())
                    {
                        if (item.TryGetProperty("name", out var n) && string.Equals(n.GetString(), countryName, StringComparison.OrdinalIgnoreCase))
                            return item.TryGetProperty("code", out var c) ? c.GetString() : null;
                    }
                    if (data.GetArrayLength() > 0)
                        return data[0].TryGetProperty("code", out var c) ? c.GetString() : null;
                }
            }
            catch { }
            return null;
        }

        private static CityDto MapGeoDbToDto(GeoDbCityData c) => new CityDto
        {
            // IMPORTANTE: Mapeamos el ID de Wikidata
            WikiDataId = c.WikiDataId,

            Nombre = c.Name ?? c.City ?? string.Empty,
            Pais = c.Country ?? string.Empty,
            CountryCode = c.CountryCode ?? c.Code ?? string.Empty,
            Region = c.Region ?? string.Empty,
            Poblacion = c.Population,
            Lat = c.Latitude,
            Lon = c.Longitude
        };
    }

    public class GeoDbResponseRoot { [JsonPropertyName("data")] public List<GeoDbCityData> Data { get; set; } = new(); }
    public class GeoDbCityData
    {
        [JsonPropertyName("id")] public int Id { get; set; }
        [JsonPropertyName("wikiDataId")] public string? WikiDataId { get; set; }
        [JsonPropertyName("type")] public string? Type { get; set; }
        [JsonPropertyName("city")] public string? City { get; set; }
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("country")] public string? Country { get; set; }
        [JsonPropertyName("countryCode")] public string? CountryCode { get; set; }
        [JsonPropertyName("code")] public string? Code { get; set; }
        [JsonPropertyName("isoCode")] public string? IsoCode { get; set; }
        [JsonPropertyName("region")] public string? Region { get; set; }
        [JsonPropertyName("population")] public int? Population { get; set; }
        [JsonPropertyName("latitude")] public double? Latitude { get; set; }
        [JsonPropertyName("longitude")] public double? Longitude { get; set; }
    }
}