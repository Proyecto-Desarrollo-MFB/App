using Volo.Abp.Modularity;

namespace WishTrip;

[DependsOn(
    typeof(WishTripApplicationModule),
    typeof(WishTripDomainTestModule)
)]
public class WishTripApplicationTestModule : AbpModule
{

}
