using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using System.Net.Http;
using System.Text.Json;

namespace WishTrip.Destinos
{
    public class GeoDbCitySearchService : ICitySearchService, ITransientDependency
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public GeoDbCitySearchService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<CitySearchResultDto> SearchCitiesAsync(CitySearchRequestDto request)
        {
            // 1. Se valida que haya algo que buscar
            if (string.IsNullOrWhiteSpace(request.PartialName))
            {
                return new CitySearchResultDto();
            }

            // 2. Se prepara el cliente HTTP
            var client = _httpClientFactory.CreateClient();

            var url = $"http://geodb-free-service.wirefreethought.com/v1/geo/cities?namePrefix={request.PartialName}&limit=5&offset=0&hateoasMode=false";

            try
            {
                // 3. Llamada (GET)
                var responseString = await client.GetStringAsync(url);

                // 4. Texto JSON a objetos C#
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var geoDbResponse = JsonSerializer.Deserialize<GeoDbResponseRoot>(responseString, options);

                // 5. Mapeamos la respuesta externa al DTO interno
                var result = new CitySearchResultDto();

                if (geoDbResponse?.Data != null)
                {
                    result.Cities = geoDbResponse.Data.Select(c => new CityDto
                    {
                        Nombre = c.Name,
                        Pais = c.Country
                    }).ToList();
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error consumiendo API externa: {ex.Message}");
                return new CitySearchResultDto();
            }
        }
    }

    public class GeoDbResponseRoot
    {
        public List<GeoDbCityData> Data { get; set; }
    }

    public class GeoDbCityData
    {
        public string Name { get; set; }
        public string Country { get; set; }
        public string Region { get; set; }
    }
}