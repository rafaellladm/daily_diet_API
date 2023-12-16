import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

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
}
