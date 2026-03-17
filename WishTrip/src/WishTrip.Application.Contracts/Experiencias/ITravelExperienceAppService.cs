using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace WishTrip.TravelExperiences
{
    public interface ITravelExperienceAppService : IApplicationService
    {
        Task<TravelExperienceDto> CreateAsync(CreateUpdateTravelExperienceDto input);
        Task<TravelExperienceDto> UpdateAsync(Guid id, CreateUpdateTravelExperienceDto input);
        Task DeleteAsync(Guid id);
        Task<TravelExperienceDto?> GetByDestinationAsync(Guid destinationId);
        Task<List<UserExperienceDto>> GetByUserNameAsync(string userName);
        Task<List<DestinationReviewDto>> GetReviewsByDestinationAsync(Guid destinationId); // ← NUEVO
        Task<UserDestinationPreferenceDto?> GetUserPreferenceAsync(Guid destinationId);
        Task<UserDestinationPreferenceDto> UpdateUserPreferenceAsync(Guid destinationId, UpdateUserPreferenceDto input);
        Task<DestinationStatsDto> GetDestinationStatsAsync(Guid destinationId);
        Task<List<TravelExperienceDto>> GetMyExperiencesByDestinationAsync(Guid destinationId);
        Task SyncHistoricalPreferencesAsync();
    }
}