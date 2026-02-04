using Shouldly;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Authorization;
using Volo.Abp.Security.Claims;
using WishTrip.EntityFrameworkCore;
using Xunit;

namespace WishTrip.Destinos;

public class Calificacion_Integration_Tests : WishTripEntityFrameworkCoreTestBase
{
    private readonly ICalificacionAppService _calificacionAppService;

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

        using (_currentPrincipalAccessor.Change(new Claim(AbpClaimTypes.UserId, userIdB.ToString())))
        {
            var listB = await _calificacionAppService.GetListAsync(new PagedAndSortedResultRequestDto());
            listB.TotalCount.ShouldBe(0);
        }
    }

    [Fact]
    public async Task Should_Fail_If_User_Not_Authenticated()
    {

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