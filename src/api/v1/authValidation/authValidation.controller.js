/**
 @author Gaurav Chauhan.
 @date    XX/XX/2018
 @version 0.1.0
*/

export function authValidation(req, res) {
  res.send(req.user);
}

export default{
  authValidation,
};
