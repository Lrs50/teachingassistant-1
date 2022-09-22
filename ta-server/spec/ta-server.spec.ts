import request = require("request-promise");
import { closeServer } from '../ta-server';

var base_url = "http://localhost:3000/";

describe("O servidor", () => {
  var server:any;

  beforeAll(() => {server = require('../ta-server')});

  afterAll(() => {server.closeServer()});

  it("inicialmente retorna uma lista de alunos vazia", () => {
    return request.get(base_url + "alunos")
            .then(body => 
               expect(body).toBe("[]")
             )
            .catch(e => 
               expect(e).toEqual(null)
             );
  })

  it("só cadastra alunos", () => {
    var options:any = {method: 'POST', uri: (base_url + "aluno"), body:{name: "Mari", cpf: "962"}, json: true};
    return request(options)
             .then(body =>
                  expect(body).toEqual({success: "O aluno foi cadastrado com sucesso"})
             ).catch(e =>
                expect(e).toEqual(null)
             )
  });


  it("não cadastra alunos com CPF duplicado", () => {
    var aluno1 = {"json":{"nome": "Mari", "cpf" : "965", "email":""}};
    var aluno2 = {"json":{"nome": "Pedro", "cpf" : "965", "email":""}};
    var resposta1 = '{"nome":"Mari","cpf":"965","email":"","metas":{}}';
    var resposta2 = '{"nome":"Pedro","cpf":"965","email":"","metas":{}}';

    return request.post(base_url + "aluno", aluno1)
             .then(body => {
                expect(body).toEqual({success: "O aluno foi cadastrado com sucesso"});
                return request.post(base_url + "aluno", aluno2)
                         .then(body => {
                            expect(body).toEqual({failure: "O aluno não pode ser cadastrado"});
                            return request.get(base_url + "alunos")
                                     .then(body => {
                                        expect(body).toContain(resposta1);
                                        expect(body).not.toContain(resposta2);
                                      });
                          });
              })
              .catch(err => {
                 expect(err).toEqual(null)
              });
 })

 it("Remove aluno com CPF no sistema", () => {
   var aluno = {"json":{"nome": "Lucas", "cpf" : "166", "email":""}};
   var resposta = '{"nome":"Lucas","cpf":"166","email":"","metas":{}}';

   return request.post(base_url + "aluno", aluno)
            .then(body => {
               expect(body).toEqual({success: "O aluno foi cadastrado com sucesso"});
               return request.delete(base_url + "aluno/" + aluno.json.cpf)
                  .then(body =>{
                     expect(body).toEqual("success: O aluno foi deletado com sucesso");
                     return request.get(base_url + "alunos")
                        .then(body => {
                           expect(body).not.toContain(resposta);
                        });
                  });
            })
            .catch(err =>{
               expect(err).toEqual(null)
            });
})

it("Não remove aluno que não existe", () => {  
   var cpf = "-616" 
   return request.delete(base_url + "aluno/" + cpf)
         .then(body =>{
               expect(body).toEqual("failure: O aluno não pode ser deletado");
            })
            .catch(err =>{
               expect(err).toEqual(null)
               });
         });
})

