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
        public string Name { get; set; } // NUEVO
        public string Email { get; set; }
        public string Bio { get; set; }
        public string AvatarUrl { get; set; }
    }

    public class UpdateProfileDto
    {
        // El UserName y el Email los dejamos sin el "?" porque sí o sí los necesitamos
        public string UserName { get; set; }
        public string Email { get; set; }

        // Le agregamos el "?" a Name, Bio y AvatarUrl para que acepten estar vacíos
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }

    // NUEVO DTO
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}