using Shouldly;
using System;
using System.Security.Claims; // Necesario para crear Claims manuales
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Authorization;
using Volo.Abp.Security.Claims; // Necesario para AbpClaimTypes
using WishTrip.EntityFrameworkCore;
using Xunit;

namespace WishTrip.Destinos;

public class Calificacion_Integration_Tests : WishTripEntityFrameworkCoreTestBase
{
    private readonly ICalificacionAppService _calificacionAppService;
    // CAMBIO 1: Usamos el Accesor Principal en lugar de ICurrentUser
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;

    public Calificacion_Integration_Tests()
    {
        _calificacionAppService = GetRequiredService<ICalificacionAppService>();
        _currentPrincipalAccessor = GetRequiredService<ICurrentPrincipalAccessor>();
    }

    [Fact]
    public async Task Should_Filter_Ratings_By_User()
    {
        var userIdA = Guid.NewGuid();
        var destinoId = Guid.NewGuid();

        // CAMBIO 2: Cambiamos el usuario manualmente creando un "Claim"
        // Esto hace exactamente lo mismo que el .Change() pero sin depender de la extensión mágica.
        using (_currentPrincipalAccessor.Change(new Claim(AbpClaimTypes.UserId, userIdA.ToString())))
        {
            await _calificacionAppService.CreateAsync(new CreateUpdateCalificacionDto
            {
                DestinoId = destinoId,
                Puntaje = 5,
                Comentario = "Soy el usuario A"
            });

            var listA = await _calificacionAppService.GetListAsync(new PagedAndSortedResultRequestDto());
            listA.TotalCount.ShouldBe(1);
        }

        var userIdB = Guid.NewGuid();
        // Cambiamos al Usuario B
        using (_currentPrincipalAccessor.Change(new Claim(AbpClaimTypes.UserId, userIdB.ToString())))
        {
            var listB = await _calificacionAppService.GetListAsync(new PagedAndSortedResultRequestDto());
            listB.TotalCount.ShouldBe(0);
        }
    }

    [Fact]
    public async Task Should_Fail_If_User_Not_Authenticated()
    {
        // Forzamos un usuario anónimo (IsAuthenticated = false)
        using (_currentPrincipalAccessor.Change(new ClaimsPrincipal(new ClaimsIdentity())))
        {
            await Assert.ThrowsAsync<AbpAuthorizationException>(async () =>
            {
                await _calificacionAppService.CreateAsync(new CreateUpdateCalificacionDto
                {
                    DestinoId = Guid.NewGuid(),
                    Puntaje = 1,
                    Comentario = "Hacker"
                });
            });
        }
    }
}