using Volo.Abp.Settings;

namespace WishTrip.Settings;

public class WishTripSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(WishTripSettings.MySetting1));
    }
}
