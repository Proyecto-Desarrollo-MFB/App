using Volo.Abp.Modularity;

namespace WishTrip;

[DependsOn(
    typeof(WishTripDomainModule),
    typeof(WishTripTestBaseModule)
)]
public class WishTripDomainTestModule : AbpModule
{

}
