using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Shouldly;
using WishTrip.Destinos;
using Xunit;

namespace WishTrip.Destinos;

public class CitySearch_IntegrationTests
{
    private readonly GeoDbCitySearchService _service;
    private readonly IHttpClientFactory _httpClientFactory;

    public CitySearch_IntegrationTests()
    {
        var httpClient = new HttpClient();

        _httpClientFactory = Substitute.For<IHttpClientFactory>();
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(httpClient);

        // Agregamos el Logger y la Configuración falsa para que no falle el constructor
        var logger = NullLogger<GeoDbCitySearchService>.Instance;
        var configuration = Substitute.For<IConfiguration>();

        _service = new GeoDbCitySearchService(_httpClientFactory, logger, configuration);
    }

    // Caso 1 y 2: Recibe resultados reales y mapea DTOs
    [Fact]
    [Trait("Category", "Integration")]
    public async Task Should_Get_Real_Results_From_GeoDB_Api()
    {
        // Arrange
        var request = new CitySearchRequestDto { PartialName = "Buenos" };

        // Act
        var result = await _service.SearchCitiesAsync(request);

        // Assert
        result.ShouldNotBeNull();
        result.Cities.ShouldNotBeEmpty();

        result.Cities.ShouldContain(c => c.Nombre.Contains("Buenos"));

        var firstCity = result.Cities[0];
        firstCity.Nombre.ShouldNotBeNullOrEmpty();
        firstCity.Pais.ShouldNotBeNullOrEmpty();
    }

    // Caso 3: Manejo de errores de red o respuestas inesperadas 
    [Fact]
    [Trait("Category", "Integration")]
    public async Task Should_Handle_Network_Errors_Gracefully()
    {
        // Arrange
        var badClient = new HttpClient();
        badClient.Dispose();

        var badFactory = Substitute.For<IHttpClientFactory>();
        badFactory.CreateClient(Arg.Any<string>()).Returns(badClient);

        // Agregamos el Logger y la Configuración falsa para el servicio con error
        var logger = NullLogger<GeoDbCitySearchService>.Instance;
        var configuration = Substitute.For<IConfiguration>();

        var serviceWithError = new GeoDbCitySearchService(badFactory, logger, configuration);

        // Act
        var result = await serviceWithError.SearchCitiesAsync(new CitySearchRequestDto { PartialName = "Paris" });

        // Assert
        result.ShouldNotBeNull();
        result.Cities.ShouldBeEmpty();
    }
}