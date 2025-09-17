using Volo.Abp.Modularity;

namespace WishTrip;

public abstract class WishTripApplicationTestBase<TStartupModule> : WishTripTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
