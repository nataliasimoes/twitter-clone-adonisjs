import { DateTime } from "luxon";
import {
  BaseModel,
  scope,
  BelongsTo,
  column,
  belongsTo,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Comment from "./Comment";
import Friend from "./Friend";

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>;

  @column()
  public post: string;

  @column()
  public isDeleted: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public static notDeleted = scope((query) => {
    query.where("is_deleted", false);
  });

  public static timeLineOfUSer = scope((query, user: User) => {
    const querysIds1 = Friend.query()
      .select("user_id1")
      .where("user_id2", user.id);
    const querysIds2 = Friend.query()
      .select("user_id2")
      .where("user_id1", user.id);

    query.where((builder) => {
      builder.orWhere("user_id", "in", querysIds1);
      builder.orWhere("user_id", "in", querysIds2);
      builder.orWhere("user_id", user.id);
    });
    query.orderBy("id", "desc");
  });

  public static timeLineProfile = scope((query, user: User) => {
      query.where("user_id", user.id);
  })
}
