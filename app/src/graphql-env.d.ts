/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: 'Query';
  mutation: 'Mutation';
  subscription: never;
  types: {
    'AddScore': { kind: 'INPUT_OBJECT'; name: 'AddScore'; isOneOf: false; inputFields: [{ name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'quizId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'score'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; }; defaultValue: null }]; };
    'Boolean': unknown;
    'CountDto': { kind: 'OBJECT'; name: 'CountDto'; fields: { 'count': { name: 'count'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'size': { name: 'size'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; }; };
    'Course': { kind: 'OBJECT'; name: 'Course'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'summary': { name: 'summary'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'text': { name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CourseItem'; ofType: null; }; }; }; } }; }; };
    'CourseCreator': { kind: 'OBJECT'; name: 'CourseCreator'; fields: { 'email': { name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'username': { name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'CourseInput': { kind: 'INPUT_OBJECT'; name: 'CourseInput'; isOneOf: false; inputFields: [{ name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'CourseItemInput'; ofType: null; }; }; }; }; defaultValue: null }, { name: 'category'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'CourseItem': { kind: 'OBJECT'; name: 'CourseItem'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'type': { name: 'type'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'CourseItemInput': { kind: 'INPUT_OBJECT'; name: 'CourseItemInput'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'type'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'DashboardQuiz': { kind: 'OBJECT'; name: 'DashboardQuiz'; fields: { 'category': { name: 'category'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'DateTime': unknown;
    'EditCourseInput': { kind: 'INPUT_OBJECT'; name: 'EditCourseInput'; isOneOf: false; inputFields: [{ name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'category'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'INPUT_OBJECT'; name: 'CourseItemInput'; ofType: null; }; }; }; }; defaultValue: null }, { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'ExtendedCourse': { kind: 'OBJECT'; name: 'ExtendedCourse'; fields: { 'creator': { name: 'creator'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CourseCreator'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'summary': { name: 'summary'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'text': { name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CourseItem'; ofType: null; }; }; }; } }; }; };
    'Float': unknown;
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'acceptFriendRequest': { name: 'acceptFriendRequest'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'NullResponse'; ofType: null; }; } }; 'addCourse': { name: 'addCourse'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; } }; 'addFriendRequest': { name: 'addFriendRequest'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'NullResponse'; ofType: null; }; } }; 'addUserScore': { name: 'addUserScore'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Quiz'; ofType: null; }; } }; 'addVerificationForm': { name: 'addVerificationForm'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; } }; 'declineFriendRequest': { name: 'declineFriendRequest'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'NullResponse'; ofType: null; }; } }; 'editCourse': { name: 'editCourse'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; } }; 'providerLogin': { name: 'providerLogin'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SigninResponse'; ofType: null; }; } }; 'removeFriend': { name: 'removeFriend'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'NullResponse'; ofType: null; }; } }; 'signin': { name: 'signin'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SigninResponse'; ofType: null; }; } }; 'signup': { name: 'signup'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SignupResponse'; ofType: null; }; } }; 'updateUser': { name: 'updateUser'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; } }; 'verifyCourse': { name: 'verifyCourse'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; } }; 'verifyUser': { name: 'verifyUser'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; } }; }; };
    'NullResponse': { kind: 'OBJECT'; name: 'NullResponse'; fields: { 'message': { name: 'message'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'PaginationDto': { kind: 'INPUT_OBJECT'; name: 'PaginationDto'; isOneOf: false; inputFields: [{ name: 'page'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; }; defaultValue: null }, { name: 'search'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }]; };
    'ProviderInput': { kind: 'INPUT_OBJECT'; name: 'ProviderInput'; isOneOf: false; inputFields: [{ name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'image'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'MyCourses': { name: 'MyCourses'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; }; }; } }; 'countCoursesWithPagination': { name: 'countCoursesWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountDto'; ofType: null; }; } }; 'countQuizWithPagination': { name: 'countQuizWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountDto'; ofType: null; }; } }; 'countUsersWithPagination': { name: 'countUsersWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountDto'; ofType: null; }; } }; 'course': { name: 'course'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; }; }; } }; 'dashboardCourses': { name: 'dashboardCourses'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'ExtendedCourse'; ofType: null; }; }; }; } }; 'getAllQuizzes': { name: 'getAllQuizzes'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Quiz'; ofType: null; }; }; }; } }; 'getAllUsers': { name: 'getAllUsers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; }; }; } }; 'getCoursesWithPagination': { name: 'getCoursesWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; }; }; } }; 'getDashboardQuizzes': { name: 'getDashboardQuizzes'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'DashboardQuiz'; ofType: null; }; }; }; } }; 'getQuizById': { name: 'getQuizById'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Quiz'; ofType: null; }; } }; 'getQuizzesWithPagination': { name: 'getQuizzesWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Quiz'; ofType: null; }; }; }; } }; 'getUserFriendRequests': { name: 'getUserFriendRequests'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; }; }; } }; 'getUserFriends': { name: 'getUserFriends'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; }; }; } }; 'getUsersWithPagination': { name: 'getUsersWithPagination'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; }; }; } }; 'getVerifyRequests': { name: 'getVerifyRequests'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VerificationFormData'; ofType: null; }; }; }; } }; 'refreshUserData': { name: 'refreshUserData'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; } }; 'unVerifiedCourses': { name: 'unVerifiedCourses'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Course'; ofType: null; }; }; }; } }; 'users': { name: 'users'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'User'; ofType: null; }; }; }; } }; }; };
    'Question': { kind: 'OBJECT'; name: 'Question'; fields: { 'answers': { name: 'answers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; } }; 'correct': { name: 'correct'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'question': { name: 'question'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'quizId': { name: 'quizId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Quiz': { kind: 'OBJECT'; name: 'Quiz'; fields: { 'UserScores': { name: 'UserScores'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UserScore'; ofType: null; }; }; }; } }; 'courseId': { name: 'courseId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'questions': { name: 'questions'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Question'; ofType: null; }; }; }; } }; }; };
    'SigninResponse': { kind: 'OBJECT'; name: 'SigninResponse'; fields: { 'access_token': { name: 'access_token'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'user': { name: 'user'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'simpleUser'; ofType: null; }; } }; }; };
    'SigninUserInput': { kind: 'INPUT_OBJECT'; name: 'SigninUserInput'; isOneOf: false; inputFields: [{ name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'password'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'SignupResponse': { kind: 'OBJECT'; name: 'SignupResponse'; fields: { 'access_token': { name: 'access_token'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'user': { name: 'user'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'simpleUser'; ofType: null; }; } }; }; };
    'SimpleModerator': { kind: 'OBJECT'; name: 'SimpleModerator'; fields: { 'categories': { name: 'categories'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updatedAt': { name: 'updatedAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'userId': { name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'SingUpUserInput': { kind: 'INPUT_OBJECT'; name: 'SingUpUserInput'; isOneOf: false; inputFields: [{ name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'password'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'String': unknown;
    'User': { kind: 'OBJECT'; name: 'User'; fields: { 'Moderator': { name: 'Moderator'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SimpleModerator'; ofType: null; }; }; }; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'email': { name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'image': { name: 'image'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'password': { name: 'password'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'role': { name: 'role'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updatedAt': { name: 'updatedAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'username': { name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'verified': { name: 'verified'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'UserEdit': { kind: 'INPUT_OBJECT'; name: 'UserEdit'; isOneOf: false; inputFields: [{ name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'role'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }, { name: 'verified'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; }; defaultValue: null }, { name: 'categories'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; }; }; defaultValue: null }]; };
    'UserScore': { kind: 'OBJECT'; name: 'UserScore'; fields: { 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'quizId': { name: 'quizId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'score': { name: 'score'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'userId': { name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VerificationForm': { kind: 'INPUT_OBJECT'; name: 'VerificationForm'; isOneOf: false; inputFields: [{ name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'VerificationFormData': { kind: 'OBJECT'; name: 'VerificationFormData'; fields: { 'User': { name: 'User'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'simpleUser'; ofType: null; }; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'text': { name: 'text'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updatedAt': { name: 'updatedAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'userId': { name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VerifyCourseDto': { kind: 'INPUT_OBJECT'; name: 'VerifyCourseDto'; isOneOf: false; inputFields: [{ name: 'courseId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'VerifyUser': { kind: 'INPUT_OBJECT'; name: 'VerifyUser'; isOneOf: false; inputFields: [{ name: 'requestId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; defaultValue: null }]; };
    'simpleUser': { kind: 'OBJECT'; name: 'simpleUser'; fields: { 'email': { name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'image': { name: 'image'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'role': { name: 'role'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'username': { name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'verified': { name: 'verified'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
  };
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}