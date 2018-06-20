/**
 @author Gaurav Chauhan.
 @date    XX/XX/2018
 @version 0.1.0
*/

export function authValidation(req, res) {
  res.send({
    email: req.user.email,
    namespace: req.user.instituteId,
  });
}

export default{
  authValidation,
};
