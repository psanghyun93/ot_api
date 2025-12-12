
const registrationCompleted = async(req, res, next) => {
  const reqUser = req.user || {};

  const query = `SELECT * FROM users WHERE id = $1`;
  const result = await db.query(query, [reqUser.id]);
  if(result.rows.length === 0){
    throw new Error(`No such user id ${reqUser.id} found.`);
  }
  const user = result.rows[0];
  return user.is_registration_complete;
}