using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Volo.Abp.Authorization;

namespace WishTrip.Destinos
{
    [Authorize]
    public class CalificacionAppService : CrudAppService<
            Calificacion,
            CalificacionDto,
            Guid,
            PagedAndSortedResultRequestDto,
            CreateUpdateCalificacionDto>, ICalificacionAppService
    {
        private readonly ICurrentUser _currentUser;

        public CalificacionAppService(
            IRepository<Calificacion, Guid> repository,
            ICurrentUser currentUser)
            : base(repository)
        {
            _currentUser = currentUser;
        }

        public override async Task<CalificacionDto> CreateAsync(CreateUpdateCalificacionDto input)
        {
            var entity = await MapToEntityAsync(input);
            if (_currentUser.Id.HasValue == false)
            {
                throw new AbpAuthorizationException("Debe estar autenticado para calificar.");
            }

            if (_currentUser.Id.HasValue)
            {
                entity.UserId = _currentUser.Id.Value;
            }


            await Repository.InsertAsync(entity);

            return await MapToGetOutputDtoAsync(entity);
        }
        protected override async Task<IQueryable<Calificacion>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
        {

            var query = await base.CreateFilteredQueryAsync(input);

            if (_currentUser.Id.HasValue)
            {
                query = query.Where(q => q.UserId == _currentUser.Id.Value);
            }

            return query;
        }
    }
}