using WishTrip.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace WishTrip.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(WishTripEntityFrameworkCoreModule),
    typeof(WishTripApplicationContractsModule)
)]
public class WishTripDbMigratorModule : AbpModule
{
}
