using Microsoft.Extensions.Localization;
using WishTrip.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace WishTrip;

[Dependency(ReplaceServices = true)]
public class WishTripBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<WishTripResource> _localizer;

    public WishTripBrandingProvider(IStringLocalizer<WishTripResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
