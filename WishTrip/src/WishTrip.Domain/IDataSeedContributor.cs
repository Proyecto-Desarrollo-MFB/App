using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using WishTrip.Destinos;

namespace WishTrip
{
    public class WishTripDataSeederContributor: IDataSeedContributor, ITransientDependency
    {
        private readonly IRepository<Destino, Guid> _destinoRepository;

        public WishTripDataSeederContributor(IRepository<Destino, Guid> destinoRepository)
        {
            _destinoRepository = destinoRepository;
        }

        public async Task SeedAsync(DataSeedContext context)
        {
            if (await _destinoRepository.GetCountAsync() <= 0)
            {
                await _destinoRepository.InsertAsync
                (
                    new Destino
                    {
                        Nombre = "Gualeguaychú",
                        Pais = "Argentina",
                        Poblacion = 200000,
                        Foto= "asd"
                    },
                    autoSave: true

                );

                await _destinoRepository.InsertAsync
                (
                new Destino
                {
                    Nombre = "Concepción",
                    Pais = "Argentina",
                    Poblacion = 150,
                    Foto = "asd"
                },
                autoSave: true
                );
            }
        }

    }
}
