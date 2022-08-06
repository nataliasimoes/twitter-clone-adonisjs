import { DateTime } from 'luxon'
import { 
  BaseModel, 
  column, 
  scope,
  beforeSave, 
  computed,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Post from 'App/Models/Post'
import Friend from 'App/Models/Friend'
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public login: string

  @column()
  public senha: string

  @column()
  public papel: 'administrador' | 'usuario'

  @hasMany(() => Post)
  public posts: HasMany<typeof Post>

  @manyToMany(() => User)
  public friends: ManyToMany<typeof User>

  @computed()
  public get password() {
    return this.senha
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.senha) {
      user.senha = await Hash.make(user.senha)
    }
  }

  public static notMyself = scope((query, user:User) => {
    query.whereNot('id', user.id)
  })

  public async hasFriend(user: User){
    const friendship = await Friend.query().orWhere(
      { 'userId1': user.id, 'userId2': this.id },
    ).orWhere({ 'userId1': this.id, 'userId2': user.id })
      
    if(friendship.length > 0){
      return true
    }else{
      return false
    }
  };
  

}
