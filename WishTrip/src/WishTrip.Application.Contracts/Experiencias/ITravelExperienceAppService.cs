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
    }
}