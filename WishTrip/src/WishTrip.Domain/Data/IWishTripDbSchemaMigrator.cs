using System.Threading.Tasks;

namespace WishTrip.Data;

public interface IWishTripDbSchemaMigrator
{
    Task MigrateAsync();
}
