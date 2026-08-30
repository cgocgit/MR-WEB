import { request } from './client.js';

export async function listProductos(){
  return Promise.resolve([
    {id:101,nombre:'Silla',categoria:'Mobiliario',precio:10},
    {id:102,nombre:'Mesa',categoria:'Mobiliario',precio:25}
  ]);
}

export async function listServicios(){
  return Promise.resolve([
    {id:201,nombre:'Montaje',duracion:'2h'},
    {id:202,nombre:'Transporte',duracion:'3h'}
  ]);
}
