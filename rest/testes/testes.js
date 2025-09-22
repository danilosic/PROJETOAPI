const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const app = require('../app'); // importa seu app.js

describe('API Checkout Demo - Testes de Integração', () => {
  let token; // será preenchido após login

  // --- REGISTER ---
  describe('Register', () => {
    it('Deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Usuário Teste',
          email: 'teste@example.com',
          password: '123456'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('email').that.equals('teste@example.com');
    });

    it('Não deve permitir registrar usuário com email já existente', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Outro Usuário',
          email: 'teste@example.com', // mesmo email do teste anterior
          password: '654321'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  // --- LOGIN ---
  describe('Login', () => {
    it('Deve realizar login com sucesso e retornar token', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'teste@example.com',
          password: '123456'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');

      token = res.body.token; // guarda token para checkout
    });

    it('Não deve permitir login com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'teste@example.com',
          password: 'senhaErrada'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error');
    });
  });

  // --- CHECKOUT ---
  describe('Checkout', () => {
    it('Deve realizar checkout com sucesso usando cartão de crédito', async () => {
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 }
          ],
          freight: 20.5,
          paymentMethod: 'credit_card',
          cardData: {
            number: '4111111111111111',
            name: 'Usuário Teste',
            expiry: '12/2030',
            cvv: '123'
          }
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('valorFinal');
      expect(res.body).to.have.property('userId');
    });

    it('Não deve permitir checkout sem token', async () => {
      const res = await request(app)
        .post('/api/checkout')
        .send({
          items: [{ productId: 1, quantity: 1 }],
          freight: 10,
          paymentMethod: 'boleto'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error');
    });
  });

});
