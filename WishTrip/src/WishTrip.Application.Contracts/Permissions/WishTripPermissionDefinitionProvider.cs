using WishTrip.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace WishTrip.Permissions;

public class WishTripPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(WishTripPermissions.GroupName);

        //Define your own permissions here. Example:
        //myGroup.AddPermission(WishTripPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<WishTripResource>(name);
    }
}
