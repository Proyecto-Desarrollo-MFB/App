using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace WishTrip.Destinos
{
    public class DestinoDto : AuditedEntityDto<Guid>
    {
        public required string Nombre { get; set; }
        public required string Pais { get; set; }
        public required string Poblacion { get; set; }
    }
}
