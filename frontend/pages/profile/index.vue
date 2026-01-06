<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="relative">
            <img
              :src="user?.profilePictureUrl || '/images/default-avatar.png'"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            />
            <button
              @click="triggerFileUpload"
              class="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload"
            />
          </div>

          <div class="flex-grow">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ user?.firstName }} {{ user?.lastName }}
            </h1>
            <p class="text-gray-600 mt-1">{{ user?.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ getRoleLabel(user?.role) }}
              </span>
              <span
                v-if="user?.isVerified"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Vérifié
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-4 text-sm font-medium border-b-2 transition"
              :class="activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <div v-show="activeTab === 'personal'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations personnelles</h2>
            <form @submit.prevent="updatePersonalInfo" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    v-model="personalForm.firstName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    v-model="personalForm.lastName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="personalForm.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  v-model="personalForm.phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div v-if="personalError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ personalError }}</p>
              </div>

              <div v-if="personalSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ personalSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="personalLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="personalLoading">Enregistrement...</span>
                <span v-else>Enregistrer les modifications</span>
              </button>
            </form>
          </div>

          <!-- Section Avocat : Informations professionnelles -->
          <div v-if="user?.role === 'avocat'" v-show="activeTab === 'professional'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">⚖️ Informations professionnelles</h2>
            <form @submit.prevent="updateProfessionalInfo" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Numéro du barreau *
                  </label>
                  <input
                    v-model="professionalForm.barNumber"
                    type="text"
                    required
                    placeholder="Ex: P12345"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p class="mt-1 text-xs text-gray-500">Obligatoire pour les avocats</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Années d'expérience
                  </label>
                  <input
                    v-model.number="professionalForm.experienceYears"
                    type="number"
                    min="0"
                    placeholder="Ex: 5"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tarif horaire (€)
                </label>
                <input
                  v-model.number="professionalForm.hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description / Bio professionnelle
                </label>
                <textarea
                  v-model="professionalForm.description"
                  rows="4"
                  placeholder="Présentez votre parcours, votre approche professionnelle..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Statut de disponibilité
                </label>
                <select
                  v-model="professionalForm.availabilityStatus"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">🟢 Disponible</option>
                  <option value="busy">🟡 Occupé</option>
                  <option value="unavailable">🔴 Indisponible</option>
                </select>
              </div>

              <div v-if="professionalError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ professionalError }}</p>
              </div>

              <div v-if="professionalSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ professionalSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="professionalLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span v-if="professionalLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </form>
          </div>

          <!-- Section Avocat : Cabinet & Localisation -->
          <div v-if="user?.role === 'avocat'" v-show="activeTab === 'office'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">🏢 Cabinet & Localisation</h2>
            <form @submit.prevent="updateOfficeInfo" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Adresse du cabinet *
                </label>
                <div class="relative">
                  <input
                    v-model="officeForm.officeAddress"
                    type="text"
                    placeholder="Commencez à taper l'adresse du cabinet..."
                    @input="handleOfficeAddressSearch"
                    @focus="showOfficeSuggestions = true"
                    @blur="hideOfficeSuggestions"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <!-- Suggestions dropdown -->
                  <div
                    v-if="showOfficeSuggestions && officeSuggestions.length > 0"
                    class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <button
                      v-for="(suggestion, index) in officeSuggestions"
                      :key="index"
                      type="button"
                      @mousedown.prevent="selectOfficeSuggestion(suggestion)"
                      class="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div class="flex-1">
                          <p class="font-medium text-gray-900 text-sm">{{ suggestion.formattedAddress }}</p>
                          <p class="text-xs text-gray-500 mt-0.5">
                            📍 GPS: {{ suggestion.latitude.toFixed(4) }}, {{ suggestion.longitude.toFixed(4) }}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-500">💡 Tapez au moins 3 caractères pour voir les suggestions</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    v-model="officeForm.officeCity"
                    type="text"
                    placeholder="Ex: Paris"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p class="mt-1 text-xs text-gray-500">Rempli automatiquement si adresse sélectionnée</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    v-model="officeForm.officePostalCode"
                    type="text"
                    placeholder="Ex: 75001"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p class="mt-1 text-xs text-gray-500">Rempli automatiquement si adresse sélectionnée</p>
                </div>
              </div>

              <!-- Champs cachés pour latitude et longitude (remplis automatiquement) -->
              <input type="hidden" v-model="officeForm.latitude" />
              <input type="hidden" v-model="officeForm.longitude" />

              <!-- Message info géolocalisation -->
              <div v-if="officeForm.latitude && officeForm.longitude" class="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-blue-800 font-medium">
                    ✅ Cabinet géolocalisé - Visible sur la carte pour les clients
                  </span>
                </div>
              </div>

              <div v-if="officeError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ officeError }}</p>
              </div>

              <div v-if="officeSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ officeSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="officeLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span v-if="officeLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </form>
          </div>

          <!-- Section Avocat : Spécialités & Compétences -->
          <div v-if="user?.role === 'avocat'" v-show="activeTab === 'specialties'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">🎓 Spécialités & Compétences</h2>
            <form @submit.prevent="updateSpecialties" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités juridiques
                </label>
                <div class="space-y-2">
                  <div v-for="(spec, index) in specialtiesForm.specialties" :key="index" class="flex gap-2">
                    <input
                      v-model="specialtiesForm.specialties[index]"
                      type="text"
                      placeholder="Ex: Droit civil, Droit pénal..."
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="specialtiesForm.specialties.splice(index, 1)"
                      class="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="specialtiesForm.specialties.push('')"
                  class="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  + Ajouter une spécialité
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Langues parlées
                </label>
                <div class="space-y-2">
                  <div v-for="(lang, index) in specialtiesForm.languages" :key="index" class="flex gap-2">
                    <input
                      v-model="specialtiesForm.languages[index]"
                      type="text"
                      placeholder="Ex: Français, Anglais..."
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="specialtiesForm.languages.splice(index, 1)"
                      class="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="specialtiesForm.languages.push('')"
                  class="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  + Ajouter une langue
                </button>
              </div>

              <div v-if="specialtiesError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ specialtiesError }}</p>
              </div>

              <div v-if="specialtiesSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ specialtiesSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="specialtiesLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span v-if="specialtiesLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </form>
          </div>

          <!-- Section Client : Adresse & Contact -->
          <div v-if="user?.role === 'client'" v-show="activeTab === 'address'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">📍 Adresse & Contact</h2>
            <form @submit.prevent="updateAddressInfo" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  v-model="addressForm.address"
                  type="text"
                  placeholder="Ex: 123 Rue Victor Hugo"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    v-model="addressForm.city"
                    type="text"
                    placeholder="Ex: Lyon"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    v-model="addressForm.postalCode"
                    type="text"
                    placeholder="Ex: 69001"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notes personnelles
                </label>
                <textarea
                  v-model="addressForm.notes"
                  rows="3"
                  placeholder="Informations complémentaires..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div v-if="addressError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ addressError }}</p>
              </div>

              <div v-if="addressSuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ addressSuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="addressLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span v-if="addressLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </form>
          </div>

          <!-- Section Client : Contact d'urgence -->
          <div v-if="user?.role === 'client'" v-show="activeTab === 'emergency'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">🚨 Contact d'urgence</h2>
            <form @submit.prevent="updateEmergencyContact" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom du contact d'urgence
                </label>
                <input
                  v-model="emergencyForm.emergencyContactName"
                  type="text"
                  placeholder="Ex: Marie Dupont"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone du contact d'urgence
                </label>
                <input
                  v-model="emergencyForm.emergencyContactPhone"
                  type="tel"
                  placeholder="Ex: 06 12 34 56 78"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p class="text-sm text-yellow-800">
                  ℹ️ Ce contact sera utilisé en cas d'urgence nécessitant de vous joindre rapidement.
                </p>
              </div>

              <div v-if="emergencyError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ emergencyError }}</p>
              </div>

              <div v-if="emergencySuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ emergencySuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="emergencyLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span v-if="emergencyLoading">Enregistrement...</span>
                <span v-else>Enregistrer</span>
              </button>
            </form>
          </div>

          <div v-show="activeTab === 'security'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Sécurité</h2>
            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  v-model="securityForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  v-model="securityForm.newPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  v-model="securityForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div v-if="securityError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ securityError }}</p>
              </div>

              <div v-if="securitySuccess" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <p class="text-sm text-green-600">{{ securitySuccess }}</p>
              </div>

              <button
                type="submit"
                :disabled="securityLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="securityLoading">Modification...</span>
                <span v-else>Modifier le mot de passe</span>
              </button>
            </form>
          </div>

          <div v-show="activeTab === 'notifications'" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Préférences de notifications</h2>
            <form @submit.prevent="updateNotificationPreferences" class="space-y-4">
              <div class="space-y-3">
                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.emailNotifications"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Recevoir les notifications par email
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.appointmentReminders"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Rappels de rendez-vous
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.caseUpdates"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Mises à jour des dossiers
                  </span>
                </label>

                <label class="flex items-center gap-3">
                  <input
                    v-model="notificationForm.messageAlerts"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    Alertes de nouveaux messages
                  </span>
                </label>
              </div>

              <button
                type="submit"
                :disabled="notificationLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="notificationLoading">Enregistrement...</span>
                <span v-else>Enregistrer les préférences</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { searchAddresses } = useGeolocation();

definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
});

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const activeTab = ref('personal');
const fileInput = ref<HTMLInputElement | null>(null);

const tabs = computed(() => {
  const baseTabs = [
    { id: 'personal', label: '👤 Informations personnelles' },
  ];

  if (user.value?.role === 'avocat') {
    baseTabs.push({ id: 'professional', label: '⚖️ Informations professionnelles' });
    baseTabs.push({ id: 'office', label: '🏢 Cabinet & Localisation' });
    baseTabs.push({ id: 'specialties', label: '🎓 Spécialités & Compétences' });
  }

  if (user.value?.role === 'client') {
    baseTabs.push({ id: 'address', label: '📍 Adresse & Contact' });
    baseTabs.push({ id: 'emergency', label: '🚨 Contact d\'urgence' });
  }

  baseTabs.push({ id: 'security', label: '🔒 Sécurité' });
  baseTabs.push({ id: 'notifications', label: '🔔 Notifications' });

  return baseTabs;
});

const personalForm = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
});

const personalLoading = ref(false);
const personalError = ref('');
const personalSuccess = ref('');

// Formulaire avocat - Professionnel
const professionalForm = ref({
  barNumber: (user.value as any)?.barNumber || '',
  experienceYears: (user.value as any)?.experienceYears || 0,
  hourlyRate: (user.value as any)?.hourlyRate || 0,
  description: (user.value as any)?.description || '',
  availabilityStatus: (user.value as any)?.availabilityStatus || 'available',
});

const professionalLoading = ref(false);
const professionalError = ref('');
const professionalSuccess = ref('');

// Formulaire avocat - Cabinet
const parseOfficeAddress = (value: any): string => {
  if (!value) return '';

  // Si c'est déjà une string simple, la retourner
  if (typeof value === 'string') {
    // Vérifier si c'est un JSON stringifié
    if (value.startsWith('{') && value.includes('"address"')) {
      try {
        const parsed = JSON.parse(value);
        return parsed.address || '';
      } catch (e) {
        console.warn('Erreur parsing JSON address:', e);
        return value;
      }
    }
    return value;
  }

  // Si c'est un objet, extraire l'adresse
  if (typeof value === 'object' && value !== null) {
    return value.address || '';
  }

  return '';
};

const officeForm = ref({
  officeAddress: parseOfficeAddress((user.value as any)?.officeAddress) || '',
  officeCity: (user.value as any)?.officeCity || '',
  officePostalCode: (user.value as any)?.officePostalCode || '',
  latitude: (user.value as any)?.latitude || null,
  longitude: (user.value as any)?.longitude || null,
});

const officeLoading = ref(false);
const officeError = ref('');
const officeSuccess = ref('');

// Watcher pour nettoyer l'adresse si elle devient un objet
watch(() => officeForm.value.officeAddress, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    console.warn('⚠️ officeAddress est un objet, conversion en string:', newValue);
    officeForm.value.officeAddress = (newValue as any).address || '';
  } else if (newValue && typeof newValue === 'string' && newValue.startsWith('{')) {
    // C'est un JSON stringifié
    try {
      const parsed = JSON.parse(newValue);
      if (parsed.address) {
        console.warn('⚠️ officeAddress est un JSON, extraction de l\'adresse:', parsed);
        officeForm.value.officeAddress = parsed.address;
      }
    } catch (e) {
      // Pas un JSON valide, laisser tel quel
    }
  }
});

// Autocomplétion adresse cabinet
const officeSuggestions = ref<any[]>([]);
const showOfficeSuggestions = ref(false);
let officeSearchTimeout: NodeJS.Timeout | null = null;

const handleOfficeAddressSearch = async () => {
  // S'assurer que l'adresse est une string
  let query = officeForm.value.officeAddress;

  if (typeof query === 'object') {
    query = (query as any).address || '';
    officeForm.value.officeAddress = query;
  }

  query = (query || '').toString().trim();

  if (!query || query.length < 3) {
    officeSuggestions.value = [];
    return;
  }

  // Debounce
  if (officeSearchTimeout) {
    clearTimeout(officeSearchTimeout);
  }

  officeSearchTimeout = setTimeout(async () => {
    try {
      officeSuggestions.value = await searchAddresses(query, 5);
      showOfficeSuggestions.value = true;
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
      officeSuggestions.value = [];
    }
  }, 300);
};

const selectOfficeSuggestion = (suggestion: any) => {
  console.log('🏢 Adresse cabinet sélectionnée:', suggestion);

  // Remplir l'adresse complète
  officeForm.value.officeAddress = suggestion.formattedAddress || suggestion.address;

  // Parser la ville et le code postal depuis formattedAddress
  // Format Nominatim: "Rue, Code Postal Ville, Région, Pays"
  const addressParts = (suggestion.formattedAddress || suggestion.address || '').split(',');

  // Essayer de trouver le code postal et la ville
  let city = '';
  let postalCode = '';

  for (const part of addressParts) {
    const trimmedPart = part.trim();

    // Chercher un code postal (5 chiffres en France)
    const postalMatch = trimmedPart.match(/\b(\d{5})\b/);
    if (postalMatch && !postalCode) {
      postalCode = postalMatch[1];
      // La ville est souvent après le code postal
      const cityMatch = trimmedPart.replace(postalCode, '').trim();
      if (cityMatch) {
        city = cityMatch;
      }
    }
  }

  // Si on n'a pas trouvé la ville dans la partie avec le code postal, essayer la 2ème partie
  if (!city && addressParts.length > 1) {
    city = addressParts[1].trim().replace(/\d{5}/, '').trim();
  }

  officeForm.value.officeCity = city;
  officeForm.value.officePostalCode = postalCode;

  // Coordonnées GPS (directement disponibles depuis Nominatim)
  officeForm.value.latitude = suggestion.latitude || null;
  officeForm.value.longitude = suggestion.longitude || null;

  showOfficeSuggestions.value = false;
  officeSuggestions.value = [];

  console.log('✅ Formulaire cabinet mis à jour:', {
    address: officeForm.value.officeAddress,
    city: officeForm.value.officeCity,
    postalCode: officeForm.value.officePostalCode,
    latitude: officeForm.value.latitude,
    longitude: officeForm.value.longitude
  });
};

const hideOfficeSuggestions = () => {
  setTimeout(() => {
    showOfficeSuggestions.value = false;
  }, 200);
};

// Formulaire avocat - Spécialités
const parseArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.replace(/[{}"]/g, '').split(',').filter(s => s.trim());
  }
  return [];
};

const specialtiesForm = ref({
  specialties: parseArray((user.value as any)?.specialties).length > 0
    ? parseArray((user.value as any)?.specialties)
    : [''],
  languages: parseArray((user.value as any)?.languages).length > 0
    ? parseArray((user.value as any)?.languages)
    : [''],
});

const specialtiesLoading = ref(false);
const specialtiesError = ref('');
const specialtiesSuccess = ref('');

// Formulaire client - Adresse
const addressForm = ref({
  address: (user.value as any)?.address || '',
  city: (user.value as any)?.city || '',
  postalCode: (user.value as any)?.postalCode || '',
  notes: (user.value as any)?.notes || '',
});

const addressLoading = ref(false);
const addressError = ref('');
const addressSuccess = ref('');

// Formulaire client - Urgence
const emergencyForm = ref({
  emergencyContactName: (user.value as any)?.emergencyContactName || '',
  emergencyContactPhone: (user.value as any)?.emergencyContactPhone || '',
});

const emergencyLoading = ref(false);
const emergencyError = ref('');
const emergencySuccess = ref('');

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const securityLoading = ref(false);
const securityError = ref('');
const securitySuccess = ref('');

const notificationForm = ref({
  emailNotifications: true,
  appointmentReminders: true,
  caseUpdates: true,
  messageAlerts: true,
});

const notificationLoading = ref(false);

const getRoleLabel = (role: string | undefined) => {
  const labels: Record<string, string> = {
    client: 'Client',
    avocat: 'Avocat',
    collaborateur: 'Collaborateur',
    admin: 'Administrateur',
  };
  return labels[role || ''] || role;
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // TODO: Implémenter l'upload de la photo de profil
  console.log('File to upload:', file);
};

const updatePersonalInfo = async () => {
  personalLoading.value = true;
  personalError.value = '';
  personalSuccess.value = '';

  try {
    const config = useRuntimeConfig();
    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        first_name: personalForm.value.firstName,
        last_name: personalForm.value.lastName,
        email: personalForm.value.email,
        phone: personalForm.value.phone,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    personalSuccess.value = '✅ Informations personnelles mises à jour avec succès';
    setTimeout(() => personalSuccess.value = '', 3000);
  } catch (error: any) {
    personalError.value = error.message || 'Une erreur est survenue';
  } finally {
    personalLoading.value = false;
  }
};

const updateProfessionalInfo = async () => {
  professionalLoading.value = true;
  professionalError.value = '';
  professionalSuccess.value = '';

  try {
    const config = useRuntimeConfig();
    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        bar_number: professionalForm.value.barNumber,
        experience_years: professionalForm.value.experienceYears,
        hourly_rate: professionalForm.value.hourlyRate,
        description: professionalForm.value.description,
        availability_status: professionalForm.value.availabilityStatus,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    professionalSuccess.value = '✅ Informations professionnelles mises à jour avec succès';
    setTimeout(() => professionalSuccess.value = '', 3000);
  } catch (error: any) {
    professionalError.value = error.message || 'Une erreur est survenue';
  } finally {
    professionalLoading.value = false;
  }
};

const updateOfficeInfo = async () => {
  officeLoading.value = true;
  officeError.value = '';
  officeSuccess.value = '';

  try {
    const config = useRuntimeConfig();
    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        office_address: officeForm.value.officeAddress,
        office_city: officeForm.value.officeCity,
        office_postal_code: officeForm.value.officePostalCode,
        latitude: officeForm.value.latitude,
        longitude: officeForm.value.longitude,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    officeSuccess.value = '✅ Informations du cabinet mises à jour avec succès';
    setTimeout(() => officeSuccess.value = '', 3000);
  } catch (error: any) {
    officeError.value = error.message || 'Une erreur est survenue';
  } finally {
    officeLoading.value = false;
  }
};

const updateSpecialties = async () => {
  specialtiesLoading.value = true;
  specialtiesError.value = '';
  specialtiesSuccess.value = '';

  try {
    const config = useRuntimeConfig();
    // Filtrer les valeurs vides
    const cleanSpecialties = specialtiesForm.value.specialties.filter(s => s.trim());
    const cleanLanguages = specialtiesForm.value.languages.filter(l => l.trim());

    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        specialties: cleanSpecialties,
        languages: cleanLanguages,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    specialtiesSuccess.value = '✅ Spécialités et langues mises à jour avec succès';
    setTimeout(() => specialtiesSuccess.value = '', 3000);
  } catch (error: any) {
    specialtiesError.value = error.message || 'Une erreur est survenue';
  } finally {
    specialtiesLoading.value = false;
  }
};

const updateAddressInfo = async () => {
  addressLoading.value = true;
  addressError.value = '';
  addressSuccess.value = '';

  try {
    const config = useRuntimeConfig();
    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        address: addressForm.value.address,
        city: addressForm.value.city,
        postal_code: addressForm.value.postalCode,
        notes: addressForm.value.notes,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    addressSuccess.value = '✅ Adresse mise à jour avec succès';
    setTimeout(() => addressSuccess.value = '', 3000);
  } catch (error: any) {
    addressError.value = error.message || 'Une erreur est survenue';
  } finally {
    addressLoading.value = false;
  }
};

const updateEmergencyContact = async () => {
  emergencyLoading.value = true;
  emergencyError.value = '';
  emergencySuccess.value = '';

  try {
    const config = useRuntimeConfig();
    const response: any = await $fetch(`${config.public.apiBaseUrl}/users/${user.value?.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: {
        emergency_contact_name: emergencyForm.value.emergencyContactName,
        emergency_contact_phone: emergencyForm.value.emergencyContactPhone,
      },
    });

    if (response.success && response.data) {
      authStore.user = response.data;
    }
    emergencySuccess.value = '✅ Contact d\'urgence mis à jour avec succès';
    setTimeout(() => emergencySuccess.value = '', 3000);
  } catch (error: any) {
    emergencyError.value = error.message || 'Une erreur est survenue';
  } finally {
    emergencyLoading.value = false;
  }
};

const updatePassword = async () => {
  securityLoading.value = true;
  securityError.value = '';
  securitySuccess.value = '';

  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    securityError.value = 'Les mots de passe ne correspondent pas';
    securityLoading.value = false;
    return;
  }

  try {
    // TODO: Implémenter la mise à jour du mot de passe
    await new Promise(resolve => setTimeout(resolve, 1000));
    securitySuccess.value = 'Mot de passe modifié avec succès';
    securityForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: any) {
    securityError.value = error.message || 'Une erreur est survenue';
  } finally {
    securityLoading.value = false;
  }
};

const updateNotificationPreferences = async () => {
  notificationLoading.value = true;

  try {
    // TODO: Implémenter la mise à jour des préférences
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  } finally {
    notificationLoading.value = false;
  }
};

watch(user, (newUser) => {
  if (newUser) {
    personalForm.value = {
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      email: newUser.email || '',
      phone: newUser.phone || '',
    };
  }
}, { immediate: true });
</script>