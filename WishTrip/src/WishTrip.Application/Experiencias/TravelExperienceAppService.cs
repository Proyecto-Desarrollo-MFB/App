using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using WishTrip.Destinos;

namespace WishTrip.TravelExperiences
{
    [Authorize]
    public class TravelExperienceAppService : ApplicationService, ITravelExperienceAppService
    {
        private readonly IRepository<TravelExperience, Guid> _repository;
        private readonly IRepository<Destino, Guid> _destinoRepository;
        private readonly IIdentityUserRepository _userRepository;
        private readonly ICurrentUser _currentUser;

        public TravelExperienceAppService(
            IRepository<TravelExperience, Guid> repository,
            IRepository<Destino, Guid> destinoRepository,
            IIdentityUserRepository userRepository,
            ICurrentUser currentUser)
        {
            _repository = repository;
            _destinoRepository = destinoRepository;
            _userRepository = userRepository;
            _currentUser = currentUser;
        }

        public async Task<TravelExperienceDto> CreateAsync(CreateUpdateTravelExperienceDto input)
        {
            var userId = _currentUser.GetId();

            // ← Se eliminó la restricción de duplicados
            var entity = new TravelExperience(
                GuidGenerator.Create(),
                input.DestinationId,
                userId,
                input.Review,
                input.Rating,
                input.IsFavorite,
                input.IsRepeatVisit,
                input.StartDate,
                input.EndDate);

            await _repository.InsertAsync(entity, autoSave: true);
            return ObjectMapper.Map<TravelExperience, TravelExperienceDto>(entity);
        }

        public async Task<TravelExperienceDto> UpdateAsync(Guid id, CreateUpdateTravelExperienceDto input)
        {
            var entity = await _repository.GetAsync(id);
            entity.Review = input.Review;
            entity.Rating = input.Rating;
            entity.IsFavorite = input.IsFavorite;
            entity.IsRepeatVisit = input.IsRepeatVisit;
            entity.StartDate = input.StartDate;
            entity.EndDate = input.EndDate;
            await _repository.UpdateAsync(entity, autoSave: true);
            return ObjectMapper.Map<TravelExperience, TravelExperienceDto>(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<TravelExperienceDto?> GetByDestinationAsync(Guid destinationId)
        {
            var userId = _currentUser.GetId();
            var experiences = await _repository.GetListAsync(
                x => x.DestinationId == destinationId && x.UserId == userId);
            var latest = experiences.OrderByDescending(x => x.CreationTime).FirstOrDefault();
            return latest == null ? null
                : ObjectMapper.Map<TravelExperience, TravelExperienceDto>(latest);
        }

        public async Task<List<UserExperienceDto>> GetByUserNameAsync(string userName)
        {
            var user = await _userRepository.FindByNormalizedUserNameAsync(userName.ToUpperInvariant());
            if (user == null) return new List<UserExperienceDto>();

            var experiences = await _repository.GetListAsync(x => x.UserId == user.Id);
            var ordered = experiences.OrderByDescending(x => x.CreationTime).ToList();
            var destinoIds = ordered.Select(x => x.DestinationId).Distinct().ToList();
            var destinos = await _destinoRepository.GetListAsync(x => destinoIds.Contains(x.Id));

            return ordered.Select(exp =>
            {
                var destino = destinos.FirstOrDefault(d => d.Id == exp.DestinationId);
                return new UserExperienceDto
                {
                    Id = exp.Id,
                    DestinationId = exp.DestinationId,
                    DestinationName = destino?.Nombre ?? "Destino desconocido",
                    DestinationPais = destino?.Pais ?? string.Empty,
                    DestinationImageUrl = destino?.Foto,
                    Review = exp.Review,
                    Rating = exp.Rating,
                    IsFavorite = exp.IsFavorite,
                    IsRepeatVisit = exp.IsRepeatVisit,
                    StartDate = exp.StartDate,
                    EndDate = exp.EndDate,
                    CreationTime = exp.CreationTime
                };
            }).ToList();
        }

        public async Task<List<DestinationReviewDto>> GetReviewsByDestinationAsync(Guid destinationId)
        {
            var experiences = await _repository.GetListAsync(x => x.DestinationId == destinationId);
            var ordered = experiences.OrderByDescending(x => x.CreationTime).ToList();

            var userIds = ordered.Select(x => x.UserId).Distinct().ToList();
            var users = await _userRepository.GetListAsync(
                sorting: null, maxResultCount: 1000, skipCount: 0, filter: null);
            var filteredUsers = users.Where(u => userIds.Contains(u.Id)).ToList();

            return ordered.Select(exp =>
            {
                var user = filteredUsers.FirstOrDefault(u => u.Id == exp.UserId);
                var avatarUrl = user?.GetProperty<string>("AvatarUrl")
                    ?? $"https://api.dicebear.com/7.x/pixel-art/svg?seed={user?.UserName}";

                return new DestinationReviewDto
                {
                    Id = exp.Id,
                    UserName = user?.UserName ?? "Usuario desconocido",
                    UserAvatarUrl = avatarUrl,
                    Review = exp.Review,
                    Rating = exp.Rating,
                    IsFavorite = exp.IsFavorite,
                    StartDate = exp.StartDate,
                    EndDate = exp.EndDate,
                    CreationTime = exp.CreationTime
                };
            }).ToList();
        }
    }
}