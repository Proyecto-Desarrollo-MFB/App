using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using WishTrip.Destinos;
using Volo.Abp.Data;

namespace WishTrip.TravelExperiences
{
    [Authorize]
    public class TravelExperienceAppService : ApplicationService, ITravelExperienceAppService
    {
        private readonly IRepository<TravelExperience, Guid> _repository;
        private readonly IRepository<Destino, Guid> _destinoRepository;
        private readonly IIdentityUserRepository _userRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IRepository<UserDestinationPreference, Guid> _preferenceRepository;

        public TravelExperienceAppService(
            IRepository<TravelExperience, Guid> repository,
            IRepository<Destino, Guid> destinoRepository,
            IIdentityUserRepository userRepository,
            ICurrentUser currentUser,
            IRepository<UserDestinationPreference, Guid> preferenceRepository)
        {
            _repository = repository;
            _destinoRepository = destinoRepository;
            _userRepository = userRepository;
            _currentUser = currentUser;
            _preferenceRepository = preferenceRepository;
        }

        public async Task<TravelExperienceDto> CreateAsync(CreateUpdateTravelExperienceDto input)
        {
            var userId = _currentUser.GetId();

            // 1. Guardar la nueva experiencia (Historial)
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

            // 2. Sincronizar el Panel (UserDestinationPreference)
            var preference = await _preferenceRepository.FirstOrDefaultAsync(
                x => x.UserId == userId && x.DestinationId == input.DestinationId);

            if (preference == null)
            {
                preference = new UserDestinationPreference(
                    GuidGenerator.Create(),
                    userId,
                    input.DestinationId,
                    input.Rating,
                    input.IsFavorite,
                    false, // IsWishlist se apaga
                    true   // IsVisited se prende porque acaba de registrar visita
                );
                await _preferenceRepository.InsertAsync(preference, autoSave: true);
            }
            else
            {
                preference.Rating = input.Rating;
                preference.IsFavorite = input.IsFavorite;
                preference.IsVisited = true;
                await _preferenceRepository.UpdateAsync(preference, autoSave: true);
            }

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
                    IsRepeatVisit = exp.IsRepeatVisit,
                    StartDate = exp.StartDate,
                    EndDate = exp.EndDate,
                    CreationTime = exp.CreationTime
                };
            }).ToList();
        }

        public async Task<UserDestinationPreferenceDto?> GetUserPreferenceAsync(Guid destinationId)
        {
            var userId = _currentUser.GetId();
            var preference = await _preferenceRepository.FirstOrDefaultAsync(
                x => x.UserId == userId && x.DestinationId == destinationId);

            if (preference == null) return null;

            return new UserDestinationPreferenceDto
            {
                Id = preference.Id,
                DestinationId = preference.DestinationId,
                Rating = preference.Rating,
                IsFavorite = preference.IsFavorite,
                IsWishlist = preference.IsWishlist,
                IsVisited = preference.IsVisited // Mapeo agregado
            };
        }

        public async Task<UserDestinationPreferenceDto> UpdateUserPreferenceAsync(Guid destinationId, UpdateUserPreferenceDto input)
        {
            var userId = _currentUser.GetId();
            var preference = await _preferenceRepository.FirstOrDefaultAsync(
                x => x.UserId == userId && x.DestinationId == destinationId);

            if (preference == null)
            {
                preference = new UserDestinationPreference(
                    GuidGenerator.Create(),
                    userId,
                    destinationId,
                    input.Rating,
                    input.IsFavorite,
                    input.IsWishlist,
                    input.IsVisited // Se pasa al constructor
                );
                await _preferenceRepository.InsertAsync(preference, autoSave: true);
            }
            else
            {
                preference.Rating = input.Rating;
                preference.IsFavorite = input.IsFavorite;
                preference.IsWishlist = input.IsWishlist;
                preference.IsVisited = input.IsVisited; // Se actualiza
                await _preferenceRepository.UpdateAsync(preference, autoSave: true);
            }

            return new UserDestinationPreferenceDto
            {
                Id = preference.Id,
                DestinationId = preference.DestinationId,
                Rating = preference.Rating,
                IsFavorite = preference.IsFavorite,
                IsWishlist = preference.IsWishlist,
                IsVisited = preference.IsVisited // Mapeo agregado
            };
        }

        public async Task<DestinationStatsDto> GetDestinationStatsAsync(Guid destinationId)
        {
            var preferences = await _preferenceRepository.GetListAsync(x => x.DestinationId == destinationId);

            var ratedPrefs = preferences.Where(x => x.Rating > 0).ToList();
            var visitCount = preferences.Count(x => x.IsVisited); // <--- Cuenta visitas reales

            return new DestinationStatsDto
            {
                AverageRating = ratedPrefs.Any() ? Math.Round(ratedPrefs.Average(x => x.Rating), 1) : 0,
                TotalRatings = ratedPrefs.Count,
                TotalVisits = visitCount // <--- Lo pasamos al DTO
            };
        }

        public async Task<List<TravelExperienceDto>> GetMyExperiencesByDestinationAsync(Guid destinationId)
        {
            var userId = _currentUser.GetId();
            var experiences = await _repository.GetListAsync(
                x => x.DestinationId == destinationId && x.UserId == userId);

            var ordered = experiences.OrderByDescending(x => x.StartDate).ToList();
            return ObjectMapper.Map<List<TravelExperience>, List<TravelExperienceDto>>(ordered);
        }

        [AllowAnonymous] // Lo dejamos abierto temporalmente para que lo puedas ejecutar fácil
        public async Task SyncHistoricalPreferencesAsync()
        {
            // 1. Traemos TODAS las experiencias históricas de la base de datos
            var allExperiences = await _repository.GetListAsync();

            // 2. Las agrupamos por Usuario y por Destino
            var groupedExperiences = allExperiences.GroupBy(x => new { x.UserId, x.DestinationId });

            foreach (var group in groupedExperiences)
            {
                var userId = group.Key.UserId;
                var destinationId = group.Key.DestinationId;

                // 3. Tomamos la experiencia más reciente de ese destino para usar su nota/like actual
                var latestExp = group.OrderByDescending(x => x.CreationTime).First();

                // 4. Nos fijamos si ya se le creó un panel a este usuario para este destino
                var existingPref = await _preferenceRepository.FirstOrDefaultAsync(
                    p => p.UserId == userId && p.DestinationId == destinationId);

                // 5. Si no tiene panel (porque es un viaje viejo), se lo creamos
                if (existingPref == null)
                {
                    var newPref = new UserDestinationPreference(
                        GuidGenerator.Create(),
                        userId,
                        destinationId,
                        latestExp.Rating,
                        latestExp.IsFavorite,
                        false, // IsWishlist
                        true   // IsVisited (¡Súper importante!)
                    );

                    await _preferenceRepository.InsertAsync(newPref, autoSave: true);
                }
            }
        }
    }
}