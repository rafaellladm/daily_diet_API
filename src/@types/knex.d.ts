import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at: string
      updated_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      date: string
      diet: boolean
      user_id: string
      created_at: string
      updated_at: string
    }
  }
}
