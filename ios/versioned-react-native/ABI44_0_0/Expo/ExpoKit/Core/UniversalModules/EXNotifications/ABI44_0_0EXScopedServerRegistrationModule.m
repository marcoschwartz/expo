// Copyright 2018-present 650 Industries. All rights reserved.

#if __has_include(<ABI44_0_0EXNotifications/ABI44_0_0EXServerRegistrationModule.h>)

#import "ABI44_0_0EXScopedServerRegistrationModule.h"
#import "ABI44_0_0EXUnversioned.h"

static NSString * const kEXRegistrationInfoKey = @"EXNotificationRegistrationInfoKey";

@interface ABI44_0_0EXServerRegistrationModule (Protected)

- (NSDictionary *)registrationSearchQueryMerging:(NSDictionary *)dictionaryToMerge;
- (NSDictionary *)keychainSearchQueryFor:(NSString *)key merging:(NSDictionary *)dictionaryToMerge;

@end

@interface ABI44_0_0EXScopedServerRegistrationModule ()

@property (nonatomic, strong) NSString *scopeKey;

@end

@implementation ABI44_0_0EXScopedServerRegistrationModule

- (instancetype)initWithScopeKey:(NSString *)scopeKey
{
  if (self = [super init]) {
    _scopeKey = scopeKey;
  }
  return self;
}

- (NSDictionary *)registrationSearchQueryMerging:(NSDictionary *)dictionaryToMerge
{
  NSString *scopedKey = [kEXRegistrationInfoKey stringByAppendingFormat:@"-%@", _scopeKey];
  return [self keychainSearchQueryFor:scopedKey merging:dictionaryToMerge];
}

@end

#endif
