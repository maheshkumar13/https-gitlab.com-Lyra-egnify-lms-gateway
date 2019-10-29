import { getModel as studentLedgerModel } from './studentLedger.model';
import { getModel as contentMappingModel } from '../settings/contentMapping/contentMapping.model';
import { getModel as textbookModel} from '../settings/textbook/textbook.model';
import { getModel as studentModel} from '../settings/student/student.model';
import { config } from '../../config/environment';
import { getModel as instituteModel } from '../settings/institute/institute.model';
import request from 'request';
import { resolveSoa } from 'dns';
const fs = require("fs");

export async function CreditCoin(req, res) {
  try {

    const { AssetId } = req.params;
    //check for if AssetId will missing.
    if(!AssetId){
      return res.status(400).send("Asset Id is missing.");
    }

    const promiseCollectionName = await Promise.all(
      [studentLedgerModel(req.user_cxt),
       contentMappingModel(req.user_cxt),
       studentModel(req.user_cxt), 
       textbookModel(req.user_cxt)
      ]);
    const studentLedger = promiseCollectionName[0];
    const contentMapping = promiseCollectionName[1];
    const student = promiseCollectionName[2];
    const TextBook = promiseCollectionName[3];

    //Check for if AssetId Is present in collection or not!!!
    try {
      const confirmation = await contentMapping.findOne({ _id: AssetId });
      console.log("confirmation", confirmation);
    } catch (error) {
      return res.status(404).send("this is invalid asset id...");
    }

    //validate assetId If this id is belong to studentId
   
      const GetStudentOrientation = student.findOne({ studentId: req.user_cxt.studentId }).select({ orientation: 1, _id: 0 });
      const GetTextBookCode = contentMapping.findOne({ _id: AssetId }).select({ coins:1,"refs.textbook.code": 1, _id: 0 });
      const PromiseData = await Promise.all([GetStudentOrientation, GetTextBookCode]);

    
      const studentOrientation = PromiseData[0].orientation;
      const studentBranch = req.user_cxt.rawHierarchy[4].child;
    

      const textbookCode = PromiseData[1].refs.textbook.code;
      const getTextBookOrientationandBranch = await TextBook.findOne({ code: textbookCode}).select({ orientations: 1, _id: 0,branches:1});
      if (getTextBookOrientationandBranch.orientations.indexOf(studentOrientation) !== -1 ||  getTextBookOrientationandBranch.branches.indexOf(studentBranch) !== -1) {
        console.log("Match value...")
      
      }else{
        return res.status(400).send("This asset is not belong to your course...")
      }
  

   

    const studentQuery = studentLedger.findOne({ studentId: req.user_cxt.studentId ,"assetId": AssetId });
    const contentMappingQuery = contentMapping.findOne({ _id: AssetId }).select({ coins: 1, _id: 0 });
    const promiseForDataFromCollection = await Promise.all([studentQuery , contentMappingQuery]);
    const studentLedgerResult = promiseForDataFromCollection[0];
    const contentMappingResult = promiseForDataFromCollection[1];
    if (!contentMappingResult){
      return res.status(400).send("Bad Asset Id")
    }
    if (studentLedgerResult){
      return res.status(405).send("You have already earned coins for this Asset..");
    }

    var Data = new studentLedger({
      coins: parseFloat(contentMappingResult.coins),
      studentId: req.user_cxt.studentId,
      typeOfTransaction: "credit",
      assetId: AssetId
    });
    await Data.save();
   return res.status(200).send(`${parseFloat(contentMappingResult.coins)} credited to your account.`);
    } catch (err) {
    console.log(err)
    return res.status(500).send("Internal server error.");
  };
}









export async function DebitCoin(req, res) {
  try {
    const { AssetId } = req.params;
    //check for if AssetId will missing.
    if (!AssetId) {
      return res.status(400).send("Asset Id is missing.");
    }
    const studentId = req.user_cxt.studentId;
    const promiseCollectionName = await Promise.all([studentLedgerModel(req.user_cxt), contentMappingModel(req.user_cxt), studentModel(req.user_cxt), textbookModel(req.user_cxt)]);

    const studentLedger = promiseCollectionName[0];
    const contentMapping = promiseCollectionName[1];
    const student = promiseCollectionName[2];
    const TextBook = promiseCollectionName[3];

    //Check for if AssetId Is present in collection or not!!!
    try {
      const confirmation = await contentMapping.findOne({ _id: AssetId });
      console.log("confirmation", confirmation);
    } catch (error) {
      return res.status(404).send("this is invalid asset id...");
    }

  
    //validate assetId If this id is belong to studentId
   
      const GetStudentOrientation = student.findOne({ studentId: req.user_cxt.studentId }).select({ orientation: 1, _id: 0 });
      const GetTextBookCode = contentMapping.findOne({ _id: AssetId }).select({ "refs.textbook.code": 1, _id: 0 });
      const PromiseData = await Promise.all([GetStudentOrientation, GetTextBookCode]);


      const studentOrientation = PromiseData[0].orientation;
      const studentBranch = req.user_cxt.rawHierarchy[4].child;


      const textbookCode = PromiseData[1].refs.textbook.code;
      const getTextBookOrientationandBranch = await TextBook.findOne({ code: textbookCode }).select({ orientations: 1, _id: 0, branches: 1 });
      if (getTextBookOrientationandBranch.orientations.indexOf(studentOrientation) !== -1 || getTextBookOrientationandBranch.branches.indexOf(studentBranch) !== -1) {
        console.log("Match value...")

      } else {
        return res.status(400).send("This asset is not belong to your course...")
      }
    

    const promiseForDataFromCollection = await Promise.all([studentLedger.findOne({ studentId: req.user_cxt.studentId ,"assetId": AssetId }), contentMapping.findOne({ _id: AssetId }, { coins: 1 }), studentLedger.find({ "studentId": studentId }, { coins: 1 })]);
    const studentLedgerResult = promiseForDataFromCollection[0];
    const contentMappingResult = promiseForDataFromCollection[1];
    const StudentAllCoins = promiseForDataFromCollection[2];
    if (!contentMappingResult) {
      return res.status(400).send("Bad Asset Id")
    }
    if (!studentLedgerResult) {
      //check for available coin or not 
      var sumOfCoin = 0;
      for (var i = 0; i < StudentAllCoins.length; i++) {
        sumOfCoin = sumOfCoin + StudentAllCoins[i].coins;
      }
      if (sumOfCoin < Math.abs(contentMappingResult.coins)){
        res.status(299).send("Sorry! But you have not sufficient ammount of coin to unlock this game...");
        
      }else{
        let Transaction = "debit"
        var Data = new studentLedger({
          coins: contentMappingResult.coins,
          studentId: studentId,
          typeOfTransaction: Transaction,
          assetId: AssetId
        });
        await Data.save();
        return res.status(200).send(`${parseFloat(contentMappingResult.coins)} debit from your account.`);
      }
    } else {
      res.status(406).send("You have already unlock  this asset...");
    }
  } catch (err) {

    return res.status(500).send("Internal server error.");
  };
}





export async function getQuery(req) {
  //console.log("req : ", req);
  const query = {};
  if(req.user_cxt.studentId) query.studentId = req.user_cxt.studentId;
  if (req.body.typeOfTransaction == "debit" || req.body.typeOfTransaction=="credit" ) query.typeOfTransaction = req.body.typeOfTransaction;
  return query;
}
export async function StudentCoinLog(req, res) {
 try{
   //statementType three kind 1. All 2. debit 3. Credit
   const studentLedger = await studentLedgerModel(req.user_cxt);
   const query = await getQuery(req);
   console.log("query : ",query);
   const studentLedgerPromise = await Promise.all([studentLedger.find(query).sort({ "created_at": -1 })]);
   const studentLedgerData=studentLedgerPromise[0];
   //console.log("studentLedgerData : ", studentLedgerData);
   var sumOfCoin=0;
   for (var i = 0; i < studentLedgerData.length; i++) {
     sumOfCoin = sumOfCoin + studentLedgerData[i].coins;
       }
       const finalBalance = {
         "finalBalance": sumOfCoin
       }
   studentLedgerData.push(finalBalance);
   console.log("studentLedgerData: ", studentLedgerData)
       return res.json(studentLedgerData);
     }
 
 catch(err){
   console.log("err: ", err);
   return res.status(500).send("Internal server error.");
 }
}
export default { CreditCoin,DebitCoin, StudentCoinLog };

