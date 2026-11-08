/**
 * Repository Instances
 * Singleton instances of all repositories
 */

import { TemplateRepository } from './template.repository'
import { ReviewRepository } from './review.repository'
import { UserRepository } from './user.repository'
import { PurchaseRepository } from './purchase.repository'
import { InstanceRepository } from './instance.repository'

// Create singleton instances
export const templateRepository = new TemplateRepository()
export const reviewRepository = new ReviewRepository()
export const userRepository = new UserRepository()
export const purchaseRepository = new PurchaseRepository()
export const instanceRepository = new InstanceRepository()

// Export all repository instances as a single object for convenience
export const repositories = {
  template: templateRepository,
  review: reviewRepository,
  user: userRepository,
  purchase: purchaseRepository,
  instance: instanceRepository,
}
