using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace WishTrip.Users
{
    public interface IUserProfileAppService : IApplicationService
    {
        Task<UserProfileDto> GetProfileAsync(string userName);
        Task UpdateProfileAsync(UpdateProfileDto input);
        Task ChangePasswordAsync(ChangePasswordDto input); // NUEVO
        Task DeleteMyAccountAsync();
        Task<List<UserProfileDto>> SearchByUserNameAsync(string query);
    }

    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
        public string AvatarUrl { get; set; }

        // --- NUEVO: Guardará las 5 ciudades en formato JSON ---
        public string? TopDestinations { get; set; }
    }

    public class UpdateProfileDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        // --- NUEVO ---
        public string? TopDestinations { get; set; }
    }

    // NUEVO DTO
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}