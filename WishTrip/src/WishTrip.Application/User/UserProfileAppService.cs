using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
                AvatarUrl = user.GetProperty<string>("AvatarUrl") ??
                            $"https://api.dicebear.com/7.x/pixel-art/svg?seed={user.UserName}",

                // --- NUEVO: Leer el Top 5 ---
                TopDestinations = user.GetProperty<string>("TopDestinations")
            };
        }

        [AllowAnonymous]
        public async Task<List<UserProfileDto>> SearchByUserNameAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return new List<UserProfileDto>();

            var allUsers = await _userRepository.GetListAsync(
                sorting: null, maxResultCount: 200, skipCount: 0, filter: null);

            var filtered = allUsers
                .Where(u => u.UserName != null &&
                            u.UserName.ToLower().Contains(query.ToLower()))
                .Take(10)
                .ToList();

            return filtered.Select(u => new UserProfileDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Name = u.Name,
                Email = u.Email,
                Bio = u.GetProperty<string>("Bio") ?? "Sin biografía.",
                AvatarUrl = u.GetProperty<string>("AvatarUrl") ??
                            $"https://api.dicebear.com/7.x/pixel-art/svg?seed={u.UserName}",

                // --- NUEVO: Leer el Top 5 ---
                TopDestinations = u.GetProperty<string>("TopDestinations")
            }).ToList();
        }

        public async Task UpdateProfileAsync(UpdateProfileDto input)
        {
            var user = await _userManager.GetByIdAsync(CurrentUser.GetId());

            if (user.UserName != input.UserName)
            {
                var result = await _userManager.SetUserNameAsync(user, input.UserName);
                if (!result.Succeeded) throw new UserFriendlyException("El nombre de usuario ya está en uso.");
            }

            user.Name = input.Name;
            user.SetProperty("Bio", input.Bio);

            // --- NUEVO: Guardar el Top 5 en la base de datos ---
            user.SetProperty("TopDestinations", input.TopDestinations);

            if (string.IsNullOrWhiteSpace(input.AvatarUrl))
            {
                user.SetProperty("AvatarUrl", null);
            }
            else
            {
                user.SetProperty("AvatarUrl", input.AvatarUrl);
            }

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