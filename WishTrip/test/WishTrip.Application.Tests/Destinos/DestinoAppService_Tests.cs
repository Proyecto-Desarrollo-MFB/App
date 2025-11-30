using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Shouldly;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Modularity;
using Volo.Abp.Validation;
using Volo.Abp.Domain.Repositories;
using Xunit;

namespace WishTrip.Destinos;

public abstract class DestinoAppService_Tests<TStartupModule> : WishTripApplicationTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly IDestinoAppService _destinoAppService;
    private readonly IRepository<Destino, Guid> _destinoRepository;

    protected DestinoAppService_Tests()
    {
        _destinoAppService = GetRequiredService<IDestinoAppService>();
        _destinoRepository = GetRequiredService<IRepository<Destino, Guid>>();

    }

    [Fact]
    public async Task Should_Get_List_Of_Destinos()
    {
        //Act
        var result = await _destinoAppService.GetListAsync(
            new PagedAndSortedResultRequestDto());

        //Assert
        result.TotalCount.ShouldBeGreaterThan(0);
        result.Items.ShouldContain(b => b.Nombre == "Gualeguaychú");
    }

    [Fact]
    public async Task Should_Create_A_Valid_Destino()
    {
        //Arrange
        var nuevoDestino = new CreateUpdateDestinoDto
        {
            Nombre = "Punta Cana",
            Pais = "República Dominicana",
            Poblacion = 5,
            Foto = "asd"
        };

        //Act
        var result = await _destinoAppService.CreateAsync(nuevoDestino);

        //Assert

        result.Id.ShouldNotBe(Guid.Empty);
        result.Nombre.ShouldBe("Punta Cana");

        var destinoFromDb = await _destinoRepository.GetAsync(result.Id);

        destinoFromDb.ShouldNotBeNull();
        destinoFromDb.Id.ShouldBe(result.Id);
        destinoFromDb.Nombre.ShouldBe(nuevoDestino.Nombre);
        destinoFromDb.Pais.ShouldBe(nuevoDestino.Pais);
    } 

    [Fact]
    public async Task Should_Not_Create_A_Destino_Without_Name()
    {
        var exception = await Assert.ThrowsAsync<AbpValidationException>(async () =>
        {
            await _destinoAppService.CreateAsync(
                new CreateUpdateDestinoDto
                {
                    Nombre = "",
                    Pais = "Uruguay",
                    Poblacion = 7,
                    Foto = "asd"
                }
            );
        });

        exception.ValidationErrors
            .ShouldContain(err => err.MemberNames.Any(mem => mem == "Nombre"));
    }

}
