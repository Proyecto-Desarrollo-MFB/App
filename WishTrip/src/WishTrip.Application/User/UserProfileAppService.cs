using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace WishTrip.Users
{
    [Authorize]
    public class UserProfileAppService : WishTripAppService, IUserProfileAppService
    {
        private readonly IdentityUserManager _userManager;
        private readonly IIdentityUserRepository _userRepository;

        public UserProfileAppService(IdentityUserManager userManager, IIdentityUserRepository userRepository)
        {
            _userManager = userManager;
            _userRepository = userRepository;
        }

        [AllowAnonymous]
        public async Task<UserProfileDto> GetProfileAsync(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Bio = user.GetProperty<string>("Bio") ?? "Sin biografía.",
                // Usamos PIXEL-ART como estilo oficial
                AvatarUrl = user.GetProperty<string>("AvatarUrl") ??
                            $"https://api.dicebear.com/7.x/pixel-art/svg?seed={user.UserName}"
            };
        }

        public async Task UpdateProfileAsync(UpdateProfileDto input)
        {
            var user = await _userManager.GetByIdAsync(CurrentUser.GetId());

            // 1. Cambio de UserName (FORMA CORRECTA PARA ABP)
            if (user.UserName != input.UserName)
            {
                var result = await _userManager.SetUserNameAsync(user, input.UserName);
                if (!result.Succeeded) throw new UserFriendlyException("El nombre de usuario ya está en uso.");
            }

            // 2. Otros datos básicos
            user.Name = input.Name;
            user.SetProperty("Bio", input.Bio);

            // 3. Manejo de Avatar (URL o null para activar Pixel Art)
            if (string.IsNullOrWhiteSpace(input.AvatarUrl))
            {
                user.SetProperty("AvatarUrl", null);
            }
            else
            {
                user.SetProperty("AvatarUrl", input.AvatarUrl);
            }

            // 4. Lógica de Email
            if (user.Email != input.Email && !string.IsNullOrWhiteSpace(input.Email))
            {
                var emailCheck = await _userManager.FindByEmailAsync(input.Email);
                if (emailCheck != null && emailCheck.Id != user.Id)
                    throw new UserFriendlyException("El correo ya está registrado.");

                await _userManager.SetEmailAsync(user, input.Email);
            }

            await _userManager.UpdateAsync(user);
        }

        public async Task ChangePasswordAsync(ChangePasswordDto input)
        {
            var user = await _userManager.GetByIdAsync(CurrentUser.GetId());
            var result = await _userManager.ChangePasswordAsync(user, input.CurrentPassword, input.NewPassword);
            if (!result.Succeeded) throw new UserFriendlyException("Error: La contraseña actual es incorrecta.");
        }

        public async Task DeleteMyAccountAsync()
        {
            var user = await _userManager.GetByIdAsync(CurrentUser.GetId());
            await _userManager.DeleteAsync(user);
        }
    }
}