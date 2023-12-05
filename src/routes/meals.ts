import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateBr: z.string(),
      hour: z.string(),
      diet: z.boolean(),
    })

    const { name, description, dateBr, hour, diet } =
      createMealsBodySchema.parse(request.body)

    const dateArray = dateBr.split('/')

    const dateTime = new Date(
      `${dateArray[2]}-${dateArray[1]}-${dateArray[0]} ${hour}`,
    )

    if (isNaN(dateTime.getTime())) {
      console.log('The date is valid:', dateTime)
    } else {
      console.log('The date is invalid!')
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date: dateTime.toISOString(),
      diet,
    })

    return reply.status(201).send()
  })
}
