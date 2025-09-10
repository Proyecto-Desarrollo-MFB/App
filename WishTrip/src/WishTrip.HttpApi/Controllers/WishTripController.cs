using WishTrip.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace WishTrip.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class WishTripController : AbpControllerBase
{
    protected WishTripController()
    {
        LocalizationResource = typeof(WishTripResource);
    }
}
