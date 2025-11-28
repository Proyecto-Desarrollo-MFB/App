using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using WishTrip.Destinos;
using Xunit;

namespace WishTrip.Destinos;

public class CitySearch_Tests
{
    private readonly IDestinoAppService _destinoAppService;
    private readonly ICitySearchService _citySearchMock;
    private readonly IRepository<Destino, Guid> _repoMock;

    public CitySearch_Tests()
    {

        _citySearchMock = Substitute.For<ICitySearchService>();


        _repoMock = Substitute.For<IRepository<Destino, Guid>>();


        _destinoAppService = new DestinoAppService(_repoMock, _citySearchMock);
    }

    [Fact]
    public async Task Should_Return_Cities_When_Found()
    {
        var input = new CitySearchRequestDto { PartialName = "Lon" };
        var fakeResult = new CitySearchResultDto
        {
            Cities = new List<CityDto>
            {
                new CityDto { Nombre = "London", Pais = "United Kingdom" },
                new CityDto { Nombre = "Londonderry", Pais = "United Kingdom" }
            }
        };

        _citySearchMock.SearchCitiesAsync(Arg.Any<CitySearchRequestDto>())
                       .Returns(Task.FromResult(fakeResult));

        var result = await _destinoAppService.SearchCitiesAsync(input);

        result.ShouldNotBeNull();
        result.Cities.Count.ShouldBe(2);
        result.Cities.ShouldContain(c => c.Nombre == "London");
    }

    [Fact]
    public async Task Should_Return_Empty_List_When_No_Results()
    {
        var emptyResult = new CitySearchResultDto { Cities = new List<CityDto>() };

        _citySearchMock.SearchCitiesAsync(Arg.Any<CitySearchRequestDto>())
                       .Returns(Task.FromResult(emptyResult));

        var result = await _destinoAppService.SearchCitiesAsync(new CitySearchRequestDto { PartialName = "Xyz123" });

        result.Cities.ShouldBeEmpty();
    }

    [Fact]
    public async Task Should_Handle_Invalid_Input()
    {
        var emptyResult = new CitySearchResultDto();

        _citySearchMock.SearchCitiesAsync(Arg.Any<CitySearchRequestDto>())
                       .Returns(Task.FromResult(emptyResult));

        var result = await _destinoAppService.SearchCitiesAsync(new CitySearchRequestDto { PartialName = "" });

        result.Cities.ShouldBeEmpty();
    }

    [Fact]
    public async Task Should_Throw_Exception_When_Api_Fails()
    {
        _citySearchMock.SearchCitiesAsync(Arg.Any<CitySearchRequestDto>())
                       .Throws(new Exception("GeoDB API is down!"));

        var exception = await Assert.ThrowsAsync<Exception>(async () =>
        {
            await _destinoAppService.SearchCitiesAsync(new CitySearchRequestDto { PartialName = "Par" });
        });

        exception.Message.ShouldBe("GeoDB API is down!");
    }
}