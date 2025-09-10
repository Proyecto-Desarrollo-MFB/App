using Volo.Abp.Modularity;

namespace WishTrip;

/* Inherit from this class for your domain layer tests. */
public abstract class WishTripDomainTestBase<TStartupModule> : WishTripTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
