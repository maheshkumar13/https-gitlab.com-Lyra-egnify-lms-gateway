import { getModel as InstituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';

export function createHierarchy(req, res) {
  const args = req.body;
  let bodyValidationFields = '';
  const mandateFields = ['country', 'class', 'state', 'city', 'branch', 'section', 'createFrom'];
  let trimString = false;
  if (args.createFrom) args.createFrom = args.createFrom.trim();
  let hierarchyPath = '';
  const checkExistingPaths = {};
  let latestPath = '';
  const order = [];
  if (args.createFrom === 'country') {
    return res.status(403).send({ message: 'Sorry!, you can not create from country' });
  }
  mandateFields.forEach((x) => {
    if (x === 'createFrom') return;
    if (args.createFrom === x) trimString = true;
    if (!args[x]) bodyValidationFields += `${x},`;
    else {
      args[x] = args[x].replace('-', ' ');
      if (trimString) {
        order.push(x);
        args[x] = args[x].trim();
        if (latestPath) latestPath += `-${args[x]}`;
        else latestPath = args[x];
        checkExistingPaths[x] = latestPath;
      } else {
        if (hierarchyPath) hierarchyPath += `-${args[x]}`;
        else hierarchyPath = args[x];
        latestPath = hierarchyPath;
      }
    }
  });
  if (bodyValidationFields) {
    return res.status(404).send({ message: `${bodyValidationFields} field(s) not found in body or can not be empty` });
  }
  if (!mandateFields.slice(0, mandateFields.length - 1).includes(args.createFrom)) {
    return res.status(403).send({ message: 'Invalid createFrom value' });
  }
  return InstituteHierarchyModel(req.user_cxt).then((InstituteHierarchy) => {
    const query = {
      pathId: { $regex: `^${hierarchyPath}$`, $options: 'i' },
      active: true,
    };
    const checkExistingPathsQuery = {
      pathId: { $regex: `^${checkExistingPaths[args.createFrom]}$`, $options: 'i' },
      active: true,
    };
    return Promise.all([
      InstituteHierarchy.findOneAndUpdate(query, { $inc: { numberOfChildren: 1 } }),
      InstituteHierarchy.findOne(checkExistingPathsQuery),
    ]).then(([hierarchyObj, toCreateObj]) => {
      if (!hierarchyObj) {
        return res.status(404).send({ message: `Invalid hierarchy to create ${args.createFrom}` });
      }

      if (toCreateObj) {
        return res.status(403).send({ message: `${args.createFrom} already exists in given hierarchy` });
      }

      hierarchyPath = hierarchyObj.pathId;
      hierarchyObj.numberOfChildren += 1; //eslint-disable-line
      let currentParentObj = hierarchyObj;
      const data = [];
      order.map((x) => { //eslint-disable-line
        const tempObj = {
          childCode: `${currentParentObj.childCode}-l${currentParentObj.level + 1}${currentParentObj.numberOfChildren}`,
          pathId: `${currentParentObj.pathId}-${args[x]}`,
          lowerPathId: `${currentParentObj.pathId}-${args[x]}`.toLowerCase(),
          child: args[x],
          parentCode: currentParentObj.childCode,
          parent: currentParentObj.child,
          level: currentParentObj.level + 1,
          levelName: x.charAt(0).toUpperCase() + x.substring(1),
          numberOfChildren: x === 'section' ? 0 : 1,
          isLeafNode: x === 'section',
          active: true,
          anscetors: currentParentObj.anscetors,
          metadata: {
            source: 'chaitanya_api',
          },
        };
        tempObj.anscetors.push({
          child: currentParentObj.child,
          childCode: currentParentObj.childCode,
          parent: currentParentObj.parent,
          parentCode: currentParentObj.parentCode,
          level: currentParentObj.level,
          levelName: currentParentObj.levelName,
        });
        currentParentObj = JSON.parse(JSON.stringify(tempObj));
        data.push(tempObj);
      });
      return InstituteHierarchy.create(data).then(() => { // eslint-disable-line
        return res.send(data);
      });
    });
  }).catch((err) => {
    console.error(err);
    return res.status(400).send({ message: 'Something went wrong!' });
  });
}
export default {
  createHierarchy,
};
