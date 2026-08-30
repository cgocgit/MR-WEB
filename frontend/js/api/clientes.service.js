import { request } from './client.js';

export async function listClientes(){
  // mock data
  return Promise.resolve([
    {id:1,nombre:'Cliente A', contacto:'clientea@mail.com'},
    {id:2,nombre:'Cliente B', contacto:'clienteb@mail.com'}
  ]);
}

export async function getCliente(id){
  return Promise.resolve({id, nombre:`Cliente ${id}`, contacto:`cliente${id}@mail.com`});
}

export async function createCliente(payload){
  // in a real implementation this would POST to the API; here we mock
  return Promise.resolve(Object.assign({id: Date.now()}, payload));
}

