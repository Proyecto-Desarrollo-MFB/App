using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace WishTrip.Destinos
{
    public class CalificacionDto : AuditedEntityDto<Guid>
    {
        public Guid DestinoId { get; set; }
        public int Puntaje { get; set; }
        public string Comentario { get; set; }
        public Guid UserId { get; set; }
    }
}