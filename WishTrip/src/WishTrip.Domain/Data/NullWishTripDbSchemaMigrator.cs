using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace WishTrip.Data;

/* This is used if database provider does't define
 * IWishTripDbSchemaMigrator implementation.
 */
public class NullWishTripDbSchemaMigrator : IWishTripDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
