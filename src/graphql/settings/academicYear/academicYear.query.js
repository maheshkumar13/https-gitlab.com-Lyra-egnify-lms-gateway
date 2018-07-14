import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLInputObjectType as InputType,
} from 'graphql';
import { AcademicYearType, AcademicYearInputType } from './academicYear.type';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';

export const GetAcademicYear = {
  args: {
    input: { type: AcademicYearInputType },
  },
  type: new List(AcademicYearType),
  async resolve(obj, args, context) {
    const body = args.input;
    const url = `${config.services.settings}/api/academicYear`;
    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
        return err.json();
      });
  },
};

export default { GetAcademicYear };
