using WishTrip.Localization;
using Volo.Abp.Application.Services;

namespace WishTrip;

/* Inherit your application services from this class.
 */
public abstract class WishTripAppService : ApplicationService
{
    protected WishTripAppService()
    {
        LocalizationResource = typeof(WishTripResource);
    }
}
