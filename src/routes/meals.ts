import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'
import { findLongestSequence } from '../middleware/findLongestSequence'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateBr: z.string(),
        hour: z.string(),
        diet: z.boolean(),
      })

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const { name, description, dateBr, hour, diet } =
        createMealsBodySchema.parse(request.body)

      const dateArray = dateBr.split('/')

      const dateTime = new Date(
        `${dateArray[2]}-${dateArray[1]}-${dateArray[0]} ${hour}`,
      )

      if (isNaN(dateTime.getTime())) {
        throw new Error('Invalid date format!')
      }

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date: dateTime.toISOString(),
        diet,
        user_id: userId,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const putMealsParamsSchema = z.object({
        name: z.string(),
        description: z.string(),
        dateBr: z.string(),
        hour: z.string(),
        diet: z.boolean(),
      })

      const { name, description, dateBr, hour, diet } =
        putMealsParamsSchema.parse(request.body)

      const date = dateBr.split('/')

      const dateTime = new Date(`${date[2]}-${date[1]}-${date[0]} ${hour}`)

      const { id } = getMealsParamsSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first().update({
        name,
        description,
        date: dateTime.toISOString(),
        diet,
      })

      if (!meal) {
        return reply.status(401).send({
          error: 'Meal not found.',
        })
      }

      return reply.status(200).send({
        message: 'meal updated successfully!',
      })
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const meal = await knex('meals')
        .where('user_id', user?.id)
        .select()

      return { meal }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const meal = await knex('meals')
        .where('id', id)
        .andWhere('user_id', user?.id)
        .select()

      return { meal }
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      await knex('meals')
        .where('id', id)
        .andWhere('user_id', user?.id)
        .delete()

      return reply.status(204).send({
        message: 'User deleted successfully',
      })
    },
  )

  app.get(
    '/total',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const total = await knex('meals')
        .where('user_id', user?.id)
        .count()

      return reply.status(200).send(total)
    },
  )

  app.get(
    '/diet',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const total = await knex('meals')
        .where('user_id', user?.id)
        .andWhere('diet', true)
        .count()

      return reply.status(200).send(total)
    },
  )

  app.get(
    '/off',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const total = await knex('meals')
        .where('user_id', user?.id)
        .andWhere('diet', false)
        .count()

      return reply.status(200).send(total)
    },
  )

  app.get(
    '/sequence',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users').where('session_id', sessionId).first()

      const total = await knex('meals')
        .where('user_id', user?.id)
        .pluck('diet')

      const sequence = findLongestSequence(total)

      return reply.status(200).send(sequence)
    },
  )
}
