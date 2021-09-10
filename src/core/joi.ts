/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
import Joi from 'joi';

function buildJoiWithExtensions() {
    let extendedJoi = Joi;

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'timestamp',
        base: joi.number().min(1466908276).max(1700000000),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'id',
        base: joi.number().min(1).max(9999999999),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'uid',
        base: joi.string().pattern(/^[a-zA-Z0-9]{28}$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'nid',
        base: joi
            .string()
            .pattern(
                /^(2|3)[0-9][0-9][0-1][1-9][0-3][1-9](01|02|03|04|11|12|13|14|15|16|17|18|19|21|22|23|24|25|26|27|28|29|31|32|33|34|35|88)\d\d\d\d\d$/,
            ),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'uuid',
        base: joi.string().pattern(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-\b[0-9a-fA-F]{12}$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'landPhone',
        base: joi
            .string()
            .pattern(
                /^(0(3|68|97|82|57|64|95|50|48|66|65|62|69|55|88|13|45|84|47|46|86|92|96|93|40|55|13)[0-9]{7}|02[0-9]{8}|0(11|12|10|15)[0-9]{8})$/,
            ),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'cellPhone',
        base: joi.string().pattern(/^0(11|12|10|15)[0-9]{8}$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'email',
        base: joi.string().pattern(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'english',
        base: joi.string().pattern(/^[(\u0621-\u064Aa-zA-Z]+$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'arabic',
        base: joi.string().pattern(/^[\u0621-\u064A]+$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'extraEnglish',
        base: joi.string().pattern(/^[a-zA-Z ]+$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'extraArabic',
        base: joi.string().pattern(/^[\u0621-\u064A ]+$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'date',
        base: joi.string().pattern(/^(19|20)[0-9][0-9][-\\/. ](0[1-9]|1[012])[-\\/. ](0[1-9]|[12][0-9]|3[01])$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'ip',
        base: joi
            .string()
            .pattern(
                /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/,
            ),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'packageName',
        base: joi.string().pattern(/^([A-Za-z]{1}[A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_-]*$/),
    }));

    extendedJoi = extendedJoi.extend((joi) => ({
        type: 'link',
        base: joi
            .string()
            .pattern(
                /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-:]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/,
            ),
    }));

    return extendedJoi;
}
/**
 * Extended from Joi add added some functions
 * @example
 * import {extendedJoi, middleWares} from 'nodejs-express-utils';
 *
 * app.get('/', middleWares.inputJoi(extendedJoi.object({name: extendedJoi.string().required()})));
 *
 * @member timestamp
 * @member id
 * @member uid
 * @member nid
 * @member landPhone
 * @member cellPhone
 * @member email
 * @member english
 * @member arabic
 * @member extraEnglish
 * @member extraArabic
 * @member date
 * @member ip
 * @member packageName
 * @member link
 */
const extendedJoi = buildJoiWithExtensions();

export default extendedJoi;
