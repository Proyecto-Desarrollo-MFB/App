using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace WishTrip.Destinos
{
    public class Destino : AuditedAggregateRoot<Guid>
    {
     public required string Nombre { get; set; }
     public required string Pais {  get; set; }
     public required int Poblacion { get; set; }
     public required string Foto { get; set; }
     public DateTime ActualizacionDesdeAPI { get; set; }
    }
}
