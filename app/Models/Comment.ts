import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, scope, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'
import User from './User'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public postId: number

  @column()
  public comment: string

  @column()
  public isDeleted: boolean

  public static notDeleted = scope((query) => {
    query.where('is_deleted', false)
  })

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
