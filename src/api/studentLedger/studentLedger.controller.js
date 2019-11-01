/**
 @author Nikhil Kumar
 @date    23/01/2018
*/
import { getModel as studentLedgerModel } from './studentLedger.model';
import { getModel as contentMappingModel } from '../settings/contentMapping/contentMapping.model';
import { getModel as textbookModel } from '../settings/textbook/textbook.model';
import { getModel as studentModel } from '../settings/student/student.model';


export async function creditCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).send("Asset Id is missing.");
    }

    const [studentLedger, contentMapping, student, textbook] = await Promise.all(
      [studentLedgerModel(req.user_cxt),
      contentMappingModel(req.user_cxt),
      studentModel(req.user_cxt),
      textbookModel(req.user_cxt)
      ]);

    //Check for if AssetId Is present in collection or not!!!
    const confirmation = await contentMapping.findOne({ "assetId": assetId });
    if (!confirmation) {
      return res.status(404).send("this is invalid asset id...");
    }

    //validate assetId If this id is belong to studentId
    const getStudentOrientation = student.findOne({ studentId: req.user_cxt.studentId }).select({ hierarchy: 1, orientation: 1, _id: 0 });
    const getTextBookCode = contentMapping.findOne({ "assetId": assetId }).select({ "content.category": 1, coins: 1, "refs.textbook.code": 1, _id: 0 });
    const promiseData = await Promise.all([getStudentOrientation, getTextBookCode]);

    const orientationName = promiseData[0].orientation;
    const className = promiseData[0].hierarchy[1].child;
    const branchName = promiseData[0].hierarchy[3].child;
    const textbookCode = promiseData[1].refs.textbook.code;
    const categoryName = promiseData[1].content.category;

    const getTextBookOrientationandBranch = await textbook.findOne({ code: textbookCode }).select({ orientations: 1, _id: 0, branches: 1 });
    if (!(getTextBookOrientationandBranch.orientations.indexOf(orientationName) !== -1 || getTextBookOrientationandBranch.branches.indexOf(branchName) !== -1)) {
      return res.status(400).send("This asset is not belong to your course...")
    }

    const studentQuery = studentLedger.findOne({ studentId: req.user_cxt.studentId, "assetId": assetId });
    const contentMappingQuery = contentMapping.findOne({ "assetId": assetId }).select({ coins: 1, _id: 0 });
    const [studentLedgerResult, contentMappingResult] = await Promise.all([studentQuery, contentMappingQuery]);

    if (!contentMappingResult) {
      return res.status(400).send("Bad Asset Id")
    }
    if (studentLedgerResult) {
      return res.status(405).send("You have already earned coins for this Asset..");
    }
    let Data = new studentLedger({
      coins: parseFloat(contentMappingResult.coins),
      studentId: req.user_cxt.studentId,
      transactionType: "credit",
      assetId: assetId,
      "refs.branch.name": branchName,
      "refs.orientation.name": orientationName,
      "refs.class.name": className,
      category: categoryName
    });
    await Data.save();

    return res.status(200).send(`${parseFloat(contentMappingResult.coins)} credited to your account.`);
  } catch (err) {
    return res.status(500).send("Internal server error.");
  };
}


export async function debitCoin(req, res) {
  try {
    const { assetId } = req.params;
    //check for if AssetId will missing.
    if (!assetId) {
      return res.status(400).send("Asset Id is missing.");
    }
    const studentId = req.user_cxt.studentId;
    const [studentLedger, contentMapping, student, textbook] = await Promise.all([studentLedgerModel(req.user_cxt), contentMappingModel(req.user_cxt), studentModel(req.user_cxt), textbookModel(req.user_cxt)]);

    //Check for if AssetId Is present in collection or not!!!
    const confirmation = await contentMapping.findOne({ "assetId": assetId });
    if (!confirmation) {
      return res.status(404).send("this is invalid asset id...");
    }

    //validate assetId If this id is belong to studentId
    const getStudentOrientation = student.findOne({ studentId: req.user_cxt.studentId }).select({ hierarchy: 1, orientation: 1, _id: 0 });
    const getTextBookCode = contentMapping.findOne({ "assetId": assetId }).select({ "content.category": 1, coins: 1, "refs.textbook.code": 1, _id: 0 });
    const promiseData = await Promise.all([getStudentOrientation, getTextBookCode]);

    const orientationName = promiseData[0].orientation;
    const className = promiseData[0].hierarchy[1].child;
    const branchName = promiseData[0].hierarchy[3].child;
    const textbookCode = promiseData[1].refs.textbook.code;
    const categoryName = promiseData[1].content.category;

    const getTextBookOrientationandBranch = await textbook.findOne({ code: textbookCode }).select({ orientations: 1, _id: 0, branches: 1 });
    if (!(getTextBookOrientationandBranch.orientations.indexOf(orientationName) !== -1 || getTextBookOrientationandBranch.branches.indexOf(branchName) !== -1)) {
      return res.status(400).send("This asset is not belong to your course...")
    }

    const [studentLedgerResult, contentMappingResult, StudentAllCoins] = await Promise.all(
      [studentLedger.findOne({ studentId: req.user_cxt.studentId, "assetId": assetId }),
      contentMapping.findOne({ "assetId": assetId }, { coins: 1 }),
      studentLedger.find({ "studentId": studentId }, { coins: 1 })]);

    if (!contentMappingResult) {
      return res.status(400).send("Bad Asset Id")
    }
    if (!studentLedgerResult) {
      //check for available coin or not 
      let sumOfCoin = 0;
      for (let i = 0; i < StudentAllCoins.length; i++) {
        sumOfCoin = sumOfCoin + StudentAllCoins[i].coins;
      }
      if (sumOfCoin < Math.abs(contentMappingResult.coins)) {
        return res.status(299).send("Sorry! But you have not sufficient ammount of coin to unlock this game...");

      } else {
        let Data = new studentLedger({
          coins: parseFloat(contentMappingResult.coins),
          studentId: req.user_cxt.studentId,
          transactionType: "debit",
          assetId: assetId,
          "refs.branch.name": branchName,
          "refs.orientation.name": orientationName,
          "refs.class.name": className,
          category: categoryName
        });
        await Data.save();
        return res.status(200).send(`${parseFloat(contentMappingResult.coins)} debit from your account.`);
      }
    } else {
      return res.status(406).send("You have already unlock  this asset...");
    }
  } catch (err) {
    return res.status(500).send("Internal server error.");
  };
}


export async function getQuery(req) {
  const query = {};
  if (req.user_cxt.studentId) query.studentId = req.user_cxt.studentId;
  if (req.body.transactionType == "debit" || req.body.transactionType == "credit") query.transactionType = req.body.transactionType;
  return query;
}
export async function studentCoinLog(req, res) {
  try {
    //statementType three kind 1. All 2. debit 3. Credit
    const studentLedger = await studentLedgerModel(req.user_cxt);
    const query = await getQuery(req);
    const studentLedgerPromise = await Promise.all([studentLedger.find(query).sort({ "created_at": -1 })]);
    const studentLedgerData = studentLedgerPromise[0];
    let sumOfCoin = 0;
    for (let i = 0; i < studentLedgerData.length; i++) {
      sumOfCoin = sumOfCoin + studentLedgerData[i].coins;
    }
    const finalBalance = {
      "finalBalance": sumOfCoin
    }
    studentLedgerData.push(finalBalance);
    return res.json(studentLedgerData);
  }
  catch (err) {
    return res.status(500).send("Internal server error.");
  }
}
export default { creditCoin, debitCoin, studentCoinLog };

